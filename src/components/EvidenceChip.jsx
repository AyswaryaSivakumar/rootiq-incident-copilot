import React from 'react';

/**
 * EvidenceChip component
 * Renders an evidence citation tag (e.g. EV-INC-PAY-001-004).
 * If the evidence ID exists in evidenceIndex, it is clickable and navigates to that item.
 * If not found in canonical_evidence, renders with a warning style and tooltip.
 *
 * @param {string} id - The evidence ID
 * @param {Map<string, object>} evidenceIndex - Map of known canonical evidence
 * @param {Function} [onOpen] - Callback when clicked (passes id)
 */
export default function EvidenceChip({ id, evidenceIndex, onOpen }) {
  if (!id) return null;

  const trimmedId = String(id).trim();
  const exists = Boolean(evidenceIndex && evidenceIndex.has(trimmedId));

  if (exists) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onOpen) onOpen(trimmedId);
        }}
        className="inline-flex items-center gap-1 font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container hover:bg-primary/10 text-primary hover:text-primary transition-colors cursor-pointer border border-surface-container-high/60 group font-medium"
        title={`View evidence: ${trimmedId}`}
      >
        <span>{trimmedId}</span>
        <span className="material-symbols-outlined text-[13px] opacity-60 group-hover:opacity-100 transition-opacity">
          open_in_new
        </span>
      </button>
    );
  }

  // Not found in canonical_evidence - highlight with subtle warning/amber
  return (
    <span
      className="inline-flex items-center gap-1 font-code-sm text-code-sm px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-medium cursor-not-allowed"
      title="ID not found in canonical_evidence for this incident"
    >
      <span className="material-symbols-outlined text-[13px] text-amber-600">warning</span>
      <span>{trimmedId}</span>
    </span>
  );
}
