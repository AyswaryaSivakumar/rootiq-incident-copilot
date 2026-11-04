/**
 * n8n Workflow Webhook Service for RootIQ
 * Dispatches post-deployment investigation requests to the n8n orchestration workflow.
 */

/**
 * Trigger an investigation run for an incident via n8n webhook.
 * Accepts optional external AbortSignal to support user-initiated cancellation.
 * Applies a 5-minute AbortController timeout limit.
 *
 * @param {string} incidentId - The incident_id to investigate
 * @param {AbortSignal} [externalSignal] - Optional signal from the caller
 * @returns {Promise<{ data: { output_id: string, validation_status: string } | null, error: { message: string, status?: number | null, hint?: string | null, rawBody?: string | null } | null }>}
 */
export async function triggerInvestigation(incidentId, externalSignal) {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      data: null,
      error: {
        message: 'VITE_N8N_WEBHOOK_URL is missing.',
        status: null,
        hint: 'Please configure VITE_N8N_WEBHOOK_URL in your AI Studio Secrets panel or .env file.',
        rawBody: null
      }
    };
  }

  // Setup 5-minute timeout controller
  const timeoutController = new AbortController();
  const timeoutMs = 5 * 60 * 1000; // 5 minutes
  let timeoutId = setTimeout(() => {
    timeoutController.abort(new DOMException('Investigation timeout after 5 minutes.', 'TimeoutError'));
  }, timeoutMs);

  // Combine external abort signal if provided
  let combinedSignal = timeoutController.signal;
  const onExternalAbort = () => timeoutController.abort(externalSignal?.reason);
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      return {
        data: null,
        error: {
          message: 'Investigation was aborted by user.',
          status: null,
          hint: null,
          rawBody: null
        }
      };
    }
    externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    console.log(`[RootIQ n8n] Sending POST to ${webhookUrl} for incident: ${incidentId}`);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ incident_id: incidentId }),
      signal: combinedSignal
    });

    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }

    const rawText = await res.text();
    console.log(`[RootIQ n8n] Webhook response status: ${res.status}`);
    console.log(`[RootIQ n8n] Webhook raw response:`, rawText);

    // Handle 404 test-webhook not listening
    if (res.status === 404) {
      return {
        data: null,
        error: {
          message: `n8n webhook returned HTTP 404 (Not Found).`,
          status: 404,
          hint: 'The n8n test webhook is not listening. Open the workflow in n8n, click Execute workflow, then press Retry.',
          rawBody: rawText
        }
      };
    }

    if (!res.ok) {
      return {
        data: null,
        error: {
          message: `n8n webhook request failed with HTTP ${res.status} ${res.statusText}.`,
          status: res.status,
          hint: null,
          rawBody: rawText
        }
      };
    }

    // Attempt to extract output_id and validation_status from response payload
    let outputId = null;
    let validationStatus = null;

    if (rawText && rawText.trim().length > 0) {
      try {
        const parsed = JSON.parse(rawText);
        const result = Array.isArray(parsed) ? parsed[0] : parsed;
        console.log(`[RootIQ n8n] Parsed payload:`, result);

        // Unwrap standard n8n container wrappers (e.g. { json: { output_id } })
        const item = result?.json || result?.data || result?.output || result?.body || result;
        outputId =
          item?.output_id ||
          item?.outputId ||
          item?.outputID ||
          item?.id ||
          result?.output_id ||
          result?.id;

        validationStatus =
          item?.validation_status ||
          item?.validationStatus ||
          item?.status ||
          result?.validation_status ||
          result?.status ||
          'passed';
      } catch (parseErr) {
        console.warn('[RootIQ n8n] Webhook response was not JSON, checking Supabase table:', parseErr);
      }
    }

    // If output_id was returned directly in the webhook payload, proceed immediately
    if (outputId) {
      return {
        data: {
          output_id: String(outputId),
          validation_status: String(validationStatus || 'passed')
        },
        error: null
      };
    }

    // If HTTP status is 200 OK but response body is empty or did not include output_id,
    // n8n was successfully triggered and may be writing the record directly to Supabase.
    // Query investigation_outputs table for this incident (polling up to 4 attempts).
    console.log(`[RootIQ n8n] Webhook returned HTTP 200 without output_id in body. Checking Supabase investigation_outputs for incident: ${incidentId}...`);
    const { fetchLatestInvestigationOutputForIncident } = await import('./investigationService');

    const maxAttempts = 4;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (combinedSignal.aborted || externalSignal?.aborted) break;

      try {
        const { data: row, error: sbError } = await fetchLatestInvestigationOutputForIncident(incidentId);
        if (row && row.output_id) {
          console.log(`[RootIQ n8n] Found investigation_outputs row in Supabase on attempt ${attempt + 1}:`, row.output_id);
          return {
            data: {
              output_id: row.output_id,
              validation_status: row.validation_status || 'passed',
              cachedRow: row
            },
            error: null
          };
        }
      } catch (pollErr) {
        console.warn(`[RootIQ n8n] Supabase query attempt ${attempt + 1} error:`, pollErr);
      }

      if (attempt < maxAttempts - 1) {
        // Wait 2.5 seconds between polling checks
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    // If no row was found after polling Supabase
    return {
      data: null,
      error: {
        message: 'n8n responded with HTTP 200, but did not return output_id and no record was found in Supabase.',
        status: res.status,
        hint: 'The n8n webhook was triggered successfully, but returned an empty response body instead of { output_id, validation_status }, and no matching row was found in Supabase "investigation_outputs" table.\n\nTo fix in n8n:\n1. Open your workflow in n8n.\n2. In the Webhook node, change "Respond" to "When Last Node Finishes" or add a "Respond to Webhook" node returning { output_id, validation_status }.\n3. Or verify that your workflow successfully inserted into the "investigation_outputs" table in Supabase.',
        rawBody: rawText ? rawText : '(empty response body from n8n webhook)'
      }
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }

    console.error('[RootIQ n8n] Request failed with exception:', err);

    if (err?.name === 'AbortError' || combinedSignal.aborted) {
      if (externalSignal?.aborted) {
        return {
          data: null,
          error: {
            message: 'Investigation was aborted by user.',
            status: null,
            hint: 'Aborting stops waiting; n8n may still finish the run.',
            rawBody: null
          }
        };
      }
      return {
        data: null,
        error: {
          message: 'The investigation request timed out after 5 minutes.',
          status: 504,
          hint: 'The n8n workflow took longer than 5 minutes to finish. Check n8n execution history.',
          rawBody: null
        }
      };
    }

    // Network error or CORS failure in browser
    return {
      data: null,
      error: {
        message: err?.message || 'Network request failed',
        status: null,
        hint: 'Could not reach n8n. This is a network or CORS problem (n8n Webhook node → Options → Allowed Origins (CORS)).',
        rawBody: null
      }
    };
  }
}
