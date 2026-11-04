import React, { useState, useEffect } from 'react';
import {
  DEMO_HYPOTHESES,
  DEMO_NEXT_STEPS,
  DEMO_INVESTIGATION_SUMMARY
} from '../demo/demoData';
import { SHOW_DEMO_FILLERS } from '../demo/demoConfig';
import DemoValue from '../components/DemoValue';
import EvidenceChip from '../components/EvidenceChip';
import { splitCitations } from '../services/hypothesisUtils';
import { fetchEvidenceSummary } from '../services/evidenceService';

/**
 * Format milliseconds into clean human-readable duration (e.g. "1 min 12 s" or "45 s")
 * Never returns "~ 2 min".
 */
function formatDuration(ms) {
  if (typeof ms !== 'number' || ms <= 0) return null;
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds} s`;
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins} min ${secs} s`;
}

export default function InvestigationResults({
  incident,
  investigationState,
  investigationOutput,
  hypotheses: rawHypotheses,
  hypothesesError,
  evidenceIndex: rawEvidenceIndex,
  canonicalEvidence: rawCanonicalEvidence,
  durationMs,
  onProceedToHumanReview,
  onViewEvidence,
  onExportReport
}) {
  const hypotheses = Array.isArray(rawHypotheses) ? rawHypotheses : [];
  const evidenceIndex = rawEvidenceIndex || new Map();
  const canonicalEvidence = Array.isArray(rawCanonicalEvidence) ? rawCanonicalEvidence : [];
  const [expandedHypotheses, setExpandedHypotheses] = useState({});
  const [evidenceSummary, setEvidenceSummary] = useState({ total: 0, bySourceType: {} });

  const incidentId = incident?.incident_id || '—';
  const validationStatus = investigationOutput?.validation_status || investigationState?.validationStatus || null;
  const outputId = investigationOutput?.output_id || investigationState?.outputId || null;

  // Determine whether an investigation has been run
  const hasRealInvestigation = Boolean(investigationOutput);
  const hasRealHypotheses = hasRealInvestigation && Array.isArray(hypotheses) && hypotheses.length > 0;

  useEffect(() => {
    if (!incident?.incident_id) return;
    let isMounted = true;
    fetchEvidenceSummary(incident.incident_id).then(({ data, error }) => {
      if (!isMounted) return;
      if (!error && data) {
        setEvidenceSummary(data);
      }
    });
    return () => { isMounted = false; };
  }, [incident?.incident_id]);

  const toggleExpand = (rank) => {
    setExpandedHypotheses(prev => ({ ...prev, [rank]: !prev[rank] }));
  };

  const getSourceTypeIcon = (type) => {
    const map = {
      metric: 'monitoring',
      metrics: 'monitoring',
      log: 'description',
      logs: 'description',
      trace: 'account_tree',
      traces: 'account_tree',
      deployment: 'publish',
      deployments: 'publish',
      dependency: 'hub',
      dependencies: 'hub'
    };
    return map[String(type).toLowerCase()] || 'analytics';
  };

  // Real total evidence count
  const totalEvidenceCount = canonicalEvidence.length > 0 ? canonicalEvidence.length : evidenceSummary.total;

  // Rank 1 hypothesis diagnostic next steps for the right-hand card
  const rank1NextSteps = hasRealHypotheses ? hypotheses[0]?.diagnostic_next_steps : null;

  // Render text containing [EV-...] citations as EvidenceChips
  const renderRichTextWithCitations = (text) => {
    const parts = splitCitations(text, evidenceIndex);
    return parts.map((part, i) => {
      if (part.type === 'evidence') {
        return (
          <span key={i} className="mx-1 inline-block align-middle">
            <EvidenceChip id={part.value} evidenceIndex={evidenceIndex} onOpen={onViewEvidence} />
          </span>
        );
      }
      return <span key={i}>{part.value}</span>;
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-space-xl max-w-6xl mx-auto w-full">
        {/* Top Banner matching approved Stitch screen with validation status & review chip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <div className="flex flex-col">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
                Investigation Complete!
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                Here are the Root Cause Analysis results for {incidentId}
              </p>
            </div>
          </div>

          {/* Real Status Badge & Output ID */}
          {(validationStatus || outputId) && (
            <div className="flex flex-col sm:items-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container-high/60">
              <div className="flex items-center gap-2 flex-wrap">
                {validationStatus && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Validation: {validationStatus}
                  </span>
                )}
                {investigationOutput && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    investigationOutput.human_review_required
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    Human review required: {investigationOutput.human_review_required ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
              {outputId && (
                <span className="font-code-sm text-[11px] text-on-surface-variant/80">
                  output_id: <span className="font-bold text-on-surface select-all">{outputId}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* 4 Key Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm sm:gap-space-lg">
          {/* Card 1: Hypotheses Count */}
          <div className="flex items-center gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container-high/40">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[24px]">lightbulb</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                {hasRealInvestigation ? (
                  <span>{hypotheses.length}</span>
                ) : (
                  <DemoValue real={null} demo={DEMO_HYPOTHESES.length} />
                )}
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                HYPOTHESES
              </span>
            </div>
          </div>

          {/* Card 2: Evidence Items (Real total from canonical_evidence) */}
          <div
            onClick={() => onViewEvidence && onViewEvidence()}
            className="flex items-center gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container-high/40 cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                {totalEvidenceCount > 0 ? (
                  <span>{totalEvidenceCount}</span>
                ) : hasRealInvestigation ? (
                  <span>0</span>
                ) : (
                  <DemoValue real={null} demo="10" />
                )}
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                EVIDENCE ITEMS
              </span>
            </div>
          </div>

          {/* Card 3: Investigation Time (Real durationMs formatted e.g. "1 min 12 s", never "~ 2 min") */}
          <div className="flex items-center gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container-high/40">
            <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                {hasRealInvestigation && durationMs ? (
                  <span>{formatDuration(durationMs)}</span>
                ) : (
                  <DemoValue real={null} demo={DEMO_INVESTIGATION_SUMMARY.duration} />
                )}
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                INVESTIGATION TIME
              </span>
            </div>
          </div>

          {/* Card 4: Data Coverage (Keep demo filler - no database source) */}
          <div className="flex items-center gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container-high/40">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                <DemoValue real={null} demo={DEMO_INVESTIGATION_SUMMARY.coverage} />
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                DATA COVERAGE
              </span>
            </div>
          </div>
        </div>

        {/* Main Two-Column Analysis Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column: Root Cause Hypotheses (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="flex items-center justify-between px-space-xs mb-space-xs">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-space-sm font-semibold">
                <span>
                  {hasRealInvestigation
                    ? (hypotheses.length === 3
                        ? 'Top 3 Root Cause Hypotheses'
                        : `Top ${hypotheses.length} Root Cause Hypotheses`)
                    : 'Top 3 Root Cause Hypotheses'}
                </span>
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              </h2>
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                {hasRealInvestigation ? (
                  <span>Causal Graph Inference</span>
                ) : (
                  <DemoValue real={null} demo="Bayesian Probability Ranked" />
                )}
              </span>
            </div>

            {/* Error banner if hypotheses failed to parse as an array */}
            {hypothesesError && (
              <div className="p-space-lg rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px]">error</span>
                <span className="font-body-sm text-body-sm font-medium">
                  Failed to parse hypotheses: {hypothesesError}
                </span>
              </div>
            )}

            {/* Real Hypotheses Cards (Phase 3 Binding) */}
            {hasRealHypotheses ? (
              hypotheses.map((hyp) => {
                const isExpanded = Boolean(expandedHypotheses[hyp.rank]);
                const rankBg =
                  hyp.rank === 1 ? 'bg-primary' : hyp.rank === 2 ? 'bg-purple-600' : 'bg-indigo-600';

                return (
                  <div
                    key={hyp.rank}
                    className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40"
                  >
                    <div className="flex items-start justify-between gap-space-md">
                      <div className="flex items-start gap-space-md min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full ${rankBg} text-white font-headline-sm text-headline-sm flex items-center justify-center shrink-0 shadow-xs font-bold`}
                        >
                          {hyp.rank}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold break-words">
                            {hyp.hypothesis}
                          </h3>
                          {/* First lines of rationale using line-clamp, without rewriting */}
                          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 line-clamp-2">
                            {hyp.rationale}
                          </p>
                        </div>
                      </div>

                      {/* Confidence percentage: shows "—" with tooltip because engine doesn't provide percentage */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">
                          Confidence
                        </span>
                        <span
                          className="font-label-md text-label-md px-2.5 py-0.5 rounded-full font-semibold border bg-surface-container text-on-surface-variant border-surface-container-high/60 cursor-help"
                          title="Not provided by the investigation engine"
                        >
                          —
                        </span>
                      </div>
                    </div>

                    {/* Evidence & Uncertainty Badges strip */}
                    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        {/* Supporting row */}
                        <div className="inline-flex items-center gap-1 font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 font-medium border border-blue-100 flex-wrap">
                          <span className="text-blue-700 font-semibold mr-1">Supporting:</span>
                          {hyp.supporting_evidence_ids.length > 0 ? (
                            hyp.supporting_evidence_ids.map((evId) => (
                              <EvidenceChip
                                key={evId}
                                id={evId}
                                evidenceIndex={evidenceIndex}
                                onOpen={onViewEvidence}
                              />
                            ))
                          ) : (
                            <span className="text-on-surface-variant text-xs">None</span>
                          )}
                        </div>

                        {/* Contradictory row */}
                        <div className="inline-flex items-center gap-1 font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200 flex-wrap">
                          <span className="text-slate-600 font-semibold mr-1">Contradictory:</span>
                          {hyp.contradictory_evidence_ids.length > 0 ? (
                            hyp.contradictory_evidence_ids.map((evId) => (
                              <EvidenceChip
                                key={evId}
                                id={evId}
                                evidenceIndex={evidenceIndex}
                                onOpen={onViewEvidence}
                              />
                            ))
                          ) : (
                            <span className="text-on-surface-variant text-xs">None</span>
                          )}
                        </div>

                        {/* Uncertainty badge: "{n} limitations noted" in neutral badge style */}
                        <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-semibold border border-surface-container-high/60">
                          {hyp.uncertainty_and_limitations.length} limitation{hyp.uncertainty_and_limitations.length === 1 ? '' : 's'} noted
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(hyp.rank)}
                        className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer border border-surface-container-high/60 shrink-0 font-medium"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        <span
                          className={`material-symbols-outlined text-[16px] transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    </div>

                    {/* Expanded Details Panel */}
                    {isExpanded && (
                      <div className="mt-space-xs pt-space-md border-t border-surface-container-high/60 flex flex-col gap-space-md bg-surface-container-low/50 p-space-md rounded-lg">
                        {/* 1. Full Rationale with citations */}
                        <div className="flex flex-col gap-1">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                            Causal Rationale & Evidence Citations
                          </span>
                          <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                            {renderRichTextWithCitations(hyp.rationale)}
                          </p>
                        </div>

                        {/* 2. Diagnostic Next Steps */}
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container-high/40">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">checklist</span>
                            <span>Diagnostic Next Steps</span>
                          </span>
                          {hyp.diagnostic_next_steps.length > 0 ? (
                            <ul className="flex flex-col gap-1 pl-1">
                              {hyp.diagnostic_next_steps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-on-surface">
                                  <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">
                                    check_circle
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-on-surface-variant italic">None provided</span>
                          )}
                        </div>

                        {/* 3. Uncertainty and Limitations */}
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container-high/40">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-amber-600">help</span>
                            <span>Uncertainty and Limitations</span>
                          </span>
                          {hyp.uncertainty_and_limitations.length > 0 ? (
                            <ul className="flex flex-col gap-1.5 pl-1">
                              {hyp.uncertainty_and_limitations.map((lim, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-on-surface">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2"></span>
                                  <span className="leading-relaxed">{renderRichTextWithCitations(lim)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-on-surface-variant italic">No limitations noted</span>
                          )}
                        </div>

                        {/* 4. Telemetry Correlation (shows "—") */}
                        <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 text-xs text-on-surface-variant">
                          <span>Telemetry correlation:</span>
                          <span className="font-medium text-on-surface" title="Not provided by the investigation engine">
                            —
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : hasRealInvestigation ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-xl border border-surface-container-high/40 text-center text-on-surface-variant italic">
                No hypotheses available in investigation output.
              </div>
            ) : SHOW_DEMO_FILLERS ? (
              /* Demo Fallback when no investigation has been run yet */
              DEMO_HYPOTHESES.map((hyp) => {
                const isExpanded = expandedHypotheses[hyp.rank];
                const badgeColor =
                  hyp.rank === 1
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : hyp.rank === 2
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                const rankBg =
                  hyp.rank === 1 ? 'bg-primary' : hyp.rank === 2 ? 'bg-purple-600' : 'bg-indigo-600';

                return (
                  <div
                    key={hyp.rank}
                    className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40"
                  >
                    <div className="flex items-start justify-between gap-space-md">
                      <div className="flex items-start gap-space-md">
                        <div
                          className={`w-8 h-8 rounded-full ${rankBg} text-white font-headline-sm text-headline-sm flex items-center justify-center shrink-0 shadow-xs font-bold`}
                        >
                          {hyp.rank}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            <DemoValue real={null} demo={hyp.title} />
                          </h3>
                          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                            <DemoValue real={null} demo={hyp.description} />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">
                          Confidence
                        </span>
                        <span className={`font-label-md text-label-md px-2.5 py-0.5 rounded-full font-semibold border ${badgeColor}`}>
                          <DemoValue real={null} demo={hyp.confidence} />
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                          <DemoValue real={null} demo={`Supporting: ${hyp.supporting.join(', ')}`} />
                        </span>
                        <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                          <DemoValue real={null} demo={`Contradictory: ${hyp.contradictory.join(', ')}`} />
                        </span>
                        <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                          <DemoValue real={null} demo={`Uncertainty: ${hyp.uncertainty}`} />
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(hyp.rank)}
                        className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer border border-surface-container-high/60"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        <span
                          className={`material-symbols-outlined text-[16px] transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-space-xs pt-space-sm border-t border-surface-container-high/60 flex flex-col gap-space-xs bg-surface-container-low/50 p-space-md rounded-lg">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                          Causal Graph Analysis
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                          <DemoValue real={null} demo={hyp.detailedExplanation} />
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-space-xl border border-surface-container-high/40 text-center text-on-surface-variant italic">
                —
              </div>
            )}
          </div>

          {/* Right Column: Evidence Overview & Next Steps (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Evidence Overview Card (Per-source_type counts from real canonical_evidence) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Evidence Overview</h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  {totalEvidenceCount > 0 ? (
                    `${totalEvidenceCount} Total`
                  ) : hasRealInvestigation ? (
                    '0 Total'
                  ) : (
                    <DemoValue real={null} demo="10 Total" />
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {Object.keys(evidenceSummary.bySourceType).length > 0 ? (
                  Object.entries(evidenceSummary.bySourceType).map(([type, count]) => (
                    <div
                      key={type}
                      onClick={() => onViewEvidence && onViewEvidence()}
                      className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-space-sm">
                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[16px]">{getSourceTypeIcon(type)}</span>
                        </div>
                        <span className="font-body-md text-body-md text-on-surface capitalize">{type}</span>
                      </div>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{count}</span>
                    </div>
                  ))
                ) : hasRealInvestigation ? (
                  <div className="text-xs text-on-surface-variant italic py-2">No evidence categories available</div>
                ) : SHOW_DEMO_FILLERS ? (
                  <>
                    <div
                      onClick={() => onViewEvidence && onViewEvidence()}
                      className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-space-sm">
                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[16px]">monitoring</span>
                        </div>
                        <span className="font-body-md text-body-md text-on-surface">
                          <DemoValue real={null} demo="Metrics" />
                        </span>
                      </div>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        <DemoValue real={null} demo="4" />
                      </span>
                    </div>
                    <div
                      onClick={() => onViewEvidence && onViewEvidence()}
                      className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-space-sm">
                        <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-purple-600">
                          <span className="material-symbols-outlined text-[16px]">description</span>
                        </div>
                        <span className="font-body-md text-body-md text-on-surface">
                          <DemoValue real={null} demo="Logs" />
                        </span>
                      </div>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        <DemoValue real={null} demo="3" />
                      </span>
                    </div>
                    <div
                      onClick={() => onViewEvidence && onViewEvidence()}
                      className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-space-sm">
                        <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        </div>
                        <span className="font-body-md text-body-md text-on-surface">
                          <DemoValue real={null} demo="Traces" />
                        </span>
                      </div>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        <DemoValue real={null} demo="1" />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-on-surface-variant italic py-2">—</div>
                )}
              </div>
            </div>

            {/* Next Steps Card (Diagnostic steps of the rank 1 hypothesis) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Next Steps</h3>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">checklist</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {hasRealInvestigation ? (
                  rank1NextSteps && rank1NextSteps.length > 0 ? (
                    rank1NextSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-space-sm p-space-xs">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span className="font-body-md text-body-md text-on-surface">
                          {step}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-on-surface-variant italic py-2">—</div>
                  )
                ) : SHOW_DEMO_FILLERS ? (
                  DEMO_NEXT_STEPS.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-space-sm p-space-xs">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span className="font-body-md text-body-md text-on-surface">
                        <DemoValue real={null} demo={step} />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-on-surface-variant italic py-2">—</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-space-sm pt-space-md">
                <button
                  type="button"
                  onClick={onExportReport}
                  className="inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors font-headline-sm text-headline-sm border border-surface-container-high/60 cursor-pointer shadow-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export Report</span>
                </button>
                <button
                  type="button"
                  onClick={onProceedToHumanReview}
                  className="inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-headline-sm text-headline-sm shadow-xs cursor-pointer font-semibold"
                >
                  <span>Human Review</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
