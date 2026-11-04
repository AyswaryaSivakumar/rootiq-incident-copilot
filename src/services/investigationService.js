/**
 * Investigation Service for RootIQ
 * Phase 2: Queries investigation_outputs table by output_id.
 * Stubs maintained for Phase 3 (hypotheses) and Phase 4 (RCA synthesis report).
 */

import { getSupabase } from './supabaseClient';

/**
 * Fetch a single investigation_outputs row by output_id from Supabase.
 *
 * @param {string} outputId
 * @returns {Promise<{ data: any | null, error: any | null }>}
 */
export async function fetchInvestigationOutputById(outputId) {
  if (!outputId) {
    return { data: null, error: new Error('output_id is required') };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('investigation_outputs')
      .select('*')
      .eq('output_id', outputId)
      .maybeSingle();

    if (error) {
      console.error(`[RootIQ] Error fetching investigation_outputs for ${outputId}:`, error);
      return { data: null, error };
    }

    if (!data) {
      return {
        data: null,
        error: new Error(`No investigation_outputs row found for output_id "${outputId}". This may indicate a Supabase Row Level Security (RLS) restriction for the anon role or an uncommitted output record.`)
      };
    }

    // Runtime discovery logging
    console.log('[RootIQ Discovery] Sample investigation_outputs row:', data);
    console.log('[RootIQ Discovery] hypotheses type/shape:', typeof data.hypotheses, Array.isArray(data.hypotheses) ? `Array (length: ${data.hypotheses.length})` : data.hypotheses);
    if (Array.isArray(data.hypotheses) && data.hypotheses.length > 0) {
      console.log('[RootIQ Discovery] Sample hypothesis keys:', Object.keys(data.hypotheses[0]));
      console.log('[RootIQ Discovery] Sample hypothesis structure:', data.hypotheses[0]);
    }

    return { data, error: null };
  } catch (err) {
    console.error(`[RootIQ] Exception in fetchInvestigationOutputById:`, err);
    return { data: null, error: err };
  }
}

/**
 * Fetch the latest investigation_outputs row for a specific incident_id from Supabase.
 * Useful when n8n triggers asynchronously or when the webhook response doesn't return output_id directly.
 *
 * @param {string} incidentId
 * @returns {Promise<{ data: any | null, error: any | null }>}
 */
export async function fetchLatestInvestigationOutputForIncident(incidentId) {
  if (!incidentId) {
    return { data: null, error: new Error('incident_id is required') };
  }

  try {
    const supabase = getSupabase();
    // Try ordering by created_at descending
    const { data, error } = await supabase
      .from('investigation_outputs')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn(`[RootIQ] Order by created_at failed, attempting without order:`, error);
      const fallback = await supabase
        .from('investigation_outputs')
        .select('*')
        .eq('incident_id', incidentId)
        .limit(1);
      if (fallback.error) {
        return { data: null, error: fallback.error };
      }
      return { data: fallback.data?.[0] || null, error: null };
    }

    const row = data?.[0] || null;
    if (row) {
      console.log('[RootIQ Discovery] Found latest investigation_outputs row for incident:', row);
      if (row.hypotheses) {
        console.log('[RootIQ Discovery] Hypotheses shape in output:', typeof row.hypotheses, row.hypotheses);
      }
    }
    return { data: row, error: null };
  } catch (err) {
    console.error(`[RootIQ] Exception in fetchLatestInvestigationOutputForIncident:`, err);
    return { data: null, error: err };
  }
}

/**
 * Fetch hypotheses for an incident.
 * // TODO Phase 3: n8n workflow will populate the investigation_outputs table with AI-generated hypotheses.
 */
export async function fetchHypotheses(incidentId) {
  return { data: null, error: null };
}

/**
 * Fetch RCA final synthesis report for an incident.
 * // TODO Phase 4: populated from approved RCA synthesis record.
 */
export async function fetchRcaReport(incidentId) {
  return { data: null, error: null };
}
