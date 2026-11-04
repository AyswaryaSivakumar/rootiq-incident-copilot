/**
 * Hypothesis Utilities for RootIQ Phase 3
 * Pure functional helpers for parsing hypotheses, splitting inline citations,
 * indexing canonical evidence, and calculating evidence-to-hypothesis bidirectional links.
 */

/**
 * Parse and normalize hypotheses from an investigation_outputs row.
 * Returns { hypotheses: Array, error: string | null, rawType: string | null }
 * If row.hypotheses is not an array, returns error and rawType.
 *
 * @param {object} row - The investigation_outputs row from Supabase
 * @returns {{ hypotheses: Array<object>, error: string | null, rawType: string | null }}
 */
export function parseHypotheses(row) {
  if (!row) {
    return { hypotheses: [], error: null, rawType: null };
  }

  const raw = row.hypotheses;
  if (!raw) {
    return { hypotheses: [], error: null, rawType: typeof raw };
  }

  if (!Array.isArray(raw)) {
    return {
      hypotheses: [],
      error: 'hypotheses is not an array',
      rawType: typeof raw
    };
  }

  const normalized = raw.map((item, idx) => {
    return {
      rank: typeof item?.rank === 'number' ? item.rank : idx + 1,
      hypothesis: typeof item?.hypothesis === 'string' ? item.hypothesis : '',
      rationale: typeof item?.rationale === 'string' ? item.rationale : '',
      diagnostic_next_steps: Array.isArray(item?.diagnostic_next_steps)
        ? item.diagnostic_next_steps
        : [],
      supporting_evidence_ids: Array.isArray(item?.supporting_evidence_ids)
        ? item.supporting_evidence_ids.map(id => String(id).trim())
        : [],
      contradictory_evidence_ids: Array.isArray(item?.contradictory_evidence_ids)
        ? item.contradictory_evidence_ids.map(id => String(id).trim())
        : [],
      uncertainty_and_limitations: Array.isArray(item?.uncertainty_and_limitations)
        ? item.uncertainty_and_limitations
        : []
    };
  });

  // Sort ascending by rank
  normalized.sort((a, b) => a.rank - b.rank);

  return {
    hypotheses: normalized,
    error: null,
    rawType: 'array'
  };
}

/**
 * Splits text into segments of text and evidence citations.
 * Recognizes citations like [EV-INC-PAY-001-004] or IDs matching the evidenceIndex.
 *
 * @param {string} text
 * @param {Map<string, any>} [evidenceIndex] - Optional Map of known canonical evidence
 * @returns {Array<{ type: 'text' | 'evidence', value: string }>}
 */
export function splitCitations(text, evidenceIndex) {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', value: '' }];
  }

  const regex = /\[([^\[\]]+)\]/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const rawContent = match[1];
    const trimmed = rawContent.trim();

    // Check if bracket content starts with 'EV-' or matches an ID in the index
    const isEvidence =
      trimmed.startsWith('EV-') ||
      Boolean(evidenceIndex && evidenceIndex.has(trimmed));

    if (isEvidence) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          value: text.slice(lastIndex, match.index)
        });
      }
      segments.push({
        type: 'evidence',
        value: trimmed
      });
      lastIndex = regex.lastIndex;
    }
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.slice(lastIndex)
    });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}

/**
 * Builds a Map from trimmed evidence_id to canonical_evidence row.
 *
 * @param {Array<object>} evidenceRows
 * @returns {Map<string, object>}
 */
export function buildEvidenceIndex(evidenceRows) {
  const map = new Map();
  if (Array.isArray(evidenceRows)) {
    for (const row of evidenceRows) {
      if (row && row.evidence_id) {
        map.set(String(row.evidence_id).trim(), row);
      }
    }
  }
  return map;
}

/**
 * Computes bidirectional links for a given evidenceId against hypotheses.
 * Returns: { supports: [rank...], contradicts: [rank...], cited: [rank...] }
 *
 * @param {string} evidenceId
 * @param {Array<object>} hypotheses
 * @returns {{ supports: number[], contradicts: number[], cited: number[] }}
 */
export function getEvidenceLinks(evidenceId, hypotheses) {
  const result = {
    supports: [],
    contradicts: [],
    cited: []
  };

  if (!evidenceId || !Array.isArray(hypotheses)) {
    return result;
  }

  const targetId = String(evidenceId).trim();
  const escapedTarget = targetId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const citationRegex = new RegExp(`\\[${escapedTarget}\\]`, 'i');

  for (const h of hypotheses) {
    const rank = h.rank;
    let isLinked = false;

    // Check supporting
    if (h.supporting_evidence_ids && h.supporting_evidence_ids.includes(targetId)) {
      result.supports.push(rank);
      isLinked = true;
    }

    // Check contradictory
    if (h.contradictory_evidence_ids && h.contradictory_evidence_ids.includes(targetId)) {
      result.contradicts.push(rank);
      isLinked = true;
    }

    // Check inline citations in rationale or uncertainty_and_limitations
    const inRationale = h.rationale && citationRegex.test(h.rationale);
    const inUncertainty = Array.isArray(h.uncertainty_and_limitations) &&
      h.uncertainty_and_limitations.some(item => citationRegex.test(item));

    if ((inRationale || inUncertainty) && !isLinked) {
      result.cited.push(rank);
    }
  }

  return result;
}
