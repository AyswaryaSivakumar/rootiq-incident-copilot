import React, { useState, useEffect } from 'react';
import { DEMO_RCA_REPORT, DEMO_TIMELINE_ENTRIES } from '../demo/demoData';
import DemoValue from '../components/DemoValue';
import EvidenceChip from '../components/EvidenceChip';
import { fetchEvidenceForIncident } from '../services/evidenceService';
import { formatUtcDateTime } from './IncidentSelection';

export default function RCAReport({
  incident,
  investigationOutput,
  hypotheses: rawHypotheses,
  evidenceIndex: rawEvidenceIndex,
  onRestartInvestigation,
  onViewEvidence
}) {
  const hypotheses = Array.isArray(rawHypotheses) ? rawHypotheses : [];
  const evidenceIndex = rawEvidenceIndex || new Map();
  const [activeTab, setActiveTab] = useState('summary');
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [realEvidence, setRealEvidence] = useState([]);

  const incidentId = incident?.incident_id || '—';
  const report = DEMO_RCA_REPORT;

  const hasRealInvestigation = Boolean(investigationOutput && Array.isArray(hypotheses) && hypotheses.length > 0);
  const rank1 = hasRealInvestigation ? hypotheses[0] : null;

  useEffect(() => {
    if (!incident?.incident_id) return;
    let isMounted = true;
    fetchEvidenceForIncident(incident.incident_id).then(({ data, error }) => {
      if (!isMounted) return;
      if (!error && data) {
        setRealEvidence(data);
      }
    });
    return () => { isMounted = false; };
  }, [incident?.incident_id]);

  // Map rank 1 diagnostic next steps into action list
  const recommendedActionList = hasRealInvestigation
    ? (rank1?.diagnostic_next_steps && rank1.diagnostic_next_steps.length > 0
        ? rank1.diagnostic_next_steps.map((step) => ({
            title: step,
            subtext: 'Diagnostic verification procedure',
            priority: '—'
          }))
        : [])
    : report.recommendedActions;

  // Rank 1 supporting evidence items via evidence index
  const supportingEvidenceItems = hasRealInvestigation && rank1?.supporting_evidence_ids
    ? rank1.supporting_evidence_ids.map((id) => {
        const row = evidenceIndex.get(id);
        return row || {
          evidence_id: id,
          source_type: 'artifact',
          service: incident?.affected_service || 'service',
          event_timestamp: null,
          isMissing: true
        };
      })
    : realEvidence;

  const handleDownload = (format = 'pdf') => {
    setIsDownloadOpen(false);
    let content = '';
    let filename = `RCA_Report_${incidentId}.${format}`;
    let mimeType = 'text/plain';

    const rootCause = hasRealInvestigation ? (rank1?.hypothesis || report.primaryRootCause) : report.primaryRootCause;
    const confidenceText = hasRealInvestigation ? '—' : `${report.confidenceScore} (${report.confidence})`;

    if (format === 'json') {
      content = JSON.stringify({
        incident_id: incidentId,
        service: incident?.affected_service,
        primaryRootCause: rootCause,
        confidence: confidenceText,
        recommendedActions: recommendedActionList,
        supportingEvidence: hasRealInvestigation ? rank1?.supporting_evidence_ids : report.keyFindings
      }, null, 2);
      mimeType = 'application/json';
    } else if (format === 'md') {
      content = `# Root Cause Analysis: ${incidentId}
**Service:** ${incident?.affected_service || '—'}
**Primary Root Cause:** ${rootCause}
**Confidence:** ${confidenceText}

## Approved by Incident Commander with — confidence score.

## Key Findings
${report.keyFindings.map(f => `- **${f.title}**: ${f.subtext}`).join('\n')}

## Recommended Diagnostic Actions
${recommendedActionList.map(a => `- **${a.title}**: ${a.subtext}`).join('\n')}
`;
      mimeType = 'text/markdown';
    } else {
      content = `ROOTIQ POSTMORTEM REPORT - ${incidentId}\nSERVICE: ${incident?.affected_service || '—'}\n\nPRIMARY ROOT CAUSE:\n${rootCause}\nCONFIDENCE: ${confidenceText}\n(Approved by Incident Commander with — confidence score)\n\nKEY FINDINGS:\n${report.keyFindings.map(f => `• ${f.title}: ${f.subtext}`).join('\n')}\n\nRECOMMENDED ACTIONS:\n${recommendedActionList.map(a => `• ${a.title}: ${a.subtext}`).join('\n')}`;
      filename = `RCA_Report_${incidentId}.txt`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl max-w-6xl mx-auto">
      {/* Top Banner matching approved Stitch screen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="w-7 h-7 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-lg sm:text-headline-xl text-on-surface font-bold tracking-tight">
            {incidentId} • RCA Report Ready
          </h1>
          <span className="text-on-surface-variant font-body-md text-sm">
            Resolved in {incident?.environment || 'staging'}
          </span>
        </div>

        {/* Download Report Button with dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
            className="inline-flex items-center gap-space-sm px-space-lg py-2 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-xs hover:bg-primary-container transition-all cursor-pointer font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download Report</span>
            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </button>

          {isDownloadOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-surface-container-lowest rounded-xl shadow-xl p-space-xs z-30 flex flex-col gap-1 border border-surface-container animate-in fade-in duration-100">
              <button
                onClick={() => handleDownload('pdf')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container text-xs transition-colors text-left w-full cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">picture_as_pdf</span>
                <span>PDF Document (.pdf)</span>
              </button>
              <button
                onClick={() => handleDownload('md')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container text-xs transition-colors text-left w-full cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">description</span>
                <span>Markdown (.md)</span>
              </button>
              <button
                onClick={() => handleDownload('json')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container text-xs transition-colors text-left w-full cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary">data_object</span>
                <span>Raw JSON Spec</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Interactive Tab Navigation */}
      <div className="flex items-center gap-space-lg border-b border-surface-container-high/60 overflow-x-auto no-scrollbar pt-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`tab-btn pb-3 font-headline-sm text-headline-sm transition-colors relative cursor-pointer font-semibold ${
            activeTab === 'summary'
              ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          Summary
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`tab-btn pb-3 font-headline-sm text-headline-sm transition-colors relative cursor-pointer font-semibold ${
            activeTab === 'evidence'
              ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          Evidence
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`tab-btn pb-3 font-headline-sm text-headline-sm transition-colors relative cursor-pointer font-semibold ${
            activeTab === 'timeline'
              ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          Timeline
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`tab-btn pb-3 font-headline-sm text-headline-sm transition-colors relative cursor-pointer font-semibold ${
            activeTab === 'actions'
              ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          Actions
        </button>
      </div>

      {/* Tab 1: Summary */}
      {activeTab === 'summary' && (
        <div className="flex flex-col gap-space-lg">
          {/* Primary Root Cause Spotlight Callout */}
          <div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-xs flex flex-col gap-space-xs border border-surface-container-high/40">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              <span className="font-label-sm text-xs font-bold uppercase tracking-wider">
                PRIMARY ROOT CAUSE
              </span>
            </div>
            <p className="font-headline-md text-headline-sm md:text-headline-md text-on-surface font-semibold leading-relaxed">
              {hasRealInvestigation ? (
                rank1?.hypothesis
              ) : (
                <DemoValue real={null} demo={report.primaryRootCause} />
              )}
            </p>
          </div>

          {/* Two-Column Grid: Key Findings & Recommended Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {/* Left Column: Key Findings (Phase 4 finishes this; MTTD, MTTR, key findings stay demo) */}
            <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between pb-space-md border-b border-surface-container-high/40">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">search_insights</span>
                  <h3 className="font-headline-md text-headline-sm font-semibold text-on-surface">Key Findings</h3>
                </div>
                <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  OBSERVED
                </span>
              </div>
              <div className="flex flex-col gap-space-md pt-space-md">
                {report.keyFindings.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-space-md">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-sm text-on-surface font-semibold">
                        <DemoValue real={null} demo={finding.title} />
                      </span>
                      <span className="font-body-sm text-xs text-on-surface-variant">
                        <DemoValue real={null} demo={finding.subtext} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Recommended Actions (Rank 1 diagnostic_next_steps, priority "—") */}
            <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between pb-space-md border-b border-surface-container-high/40">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
                  <h3 className="font-headline-md text-headline-sm font-semibold text-on-surface">Recommended Actions</h3>
                </div>
                <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  DIAGNOSTICS
                </span>
              </div>
              <div className="flex flex-col gap-space-md pt-space-md">
                {hasRealInvestigation ? (
                  recommendedActionList.length > 0 ? (
                    recommendedActionList.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-space-md">
                        <div className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-sm text-on-surface font-semibold">
                            {action.title}
                          </span>
                          <span className="font-body-sm text-xs text-on-surface-variant">
                            {action.subtext}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-on-surface-variant italic py-2">—</div>
                  )
                ) : (
                  report.recommendedActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-space-md">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-sm text-on-surface font-semibold">
                          <DemoValue real={null} demo={action.title} />
                        </span>
                        <span className="font-body-sm text-xs text-on-surface-variant">
                          <DemoValue real={null} demo={action.subtext} />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Evidence (Rank 1 supporting evidence items via evidenceIndex) */}
      {activeTab === 'evidence' && (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
          <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high/60">
            <h3 className="font-headline-md text-headline-sm font-semibold text-on-surface">
              {hasRealInvestigation ? 'Primary Supporting Evidence Dossier' : 'Referenced Evidence Dossier'}
            </h3>
            <button
              onClick={() => onViewEvidence && onViewEvidence()}
              className="text-primary hover:underline font-label-md text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect in Evidence Details Explorer</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 divide-y divide-surface-container-high/50 font-body-sm text-body-sm">
            {supportingEvidenceItems.length > 0 ? (
              supportingEvidenceItems.map((item) => (
                <div
                  key={item.evidence_id}
                  onClick={() => onViewEvidence && onViewEvidence(item.evidence_id)}
                  className="py-3 flex items-center justify-between flex-wrap gap-2 hover:bg-surface-container-low px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <EvidenceChip id={item.evidence_id} evidenceIndex={evidenceIndex} onOpen={onViewEvidence} />
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold text-xs capitalize">
                      {item.source_type}
                    </span>
                    <span className="font-medium text-on-surface">{item.source_type} · {item.service}</span>
                  </div>
                  <span className="text-on-surface-variant text-xs">
                    {item.event_timestamp ? formatUtcDateTime(item.event_timestamp) : '—'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-on-surface-variant italic">
                No supporting evidence items linked.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
          <h3 className="font-headline-md text-headline-sm font-semibold text-on-surface pb-space-sm border-b border-surface-container-high/60">
            Incident Sequence Timeline
          </h3>
          <div className="flex flex-col gap-space-md pl-4 border-l-2 border-primary/30 my-2">
            {DEMO_TIMELINE_ENTRIES.map((entry, idx) => (
              <div key={idx} className="relative pl-4">
                <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-surface-container-lowest ${
                  entry.color === 'error' ? 'bg-error' : entry.color === 'emerald-600' ? 'bg-emerald-600' : 'bg-primary'
                }`}></span>
                <span className={`font-code-sm text-xs font-bold ${
                  entry.color === 'error' ? 'text-error' : entry.color === 'emerald-600' ? 'text-emerald-600' : 'text-primary'
                }`}>
                  <DemoValue real={null} demo={entry.time} />
                </span>
                <p className="font-headline-sm text-sm text-on-surface font-semibold">
                  <DemoValue real={null} demo={entry.title} />
                </p>
                <p className="text-on-surface-variant text-xs">
                  <DemoValue real={null} demo={entry.subtext} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Actions (Priority badges "P0/P1/P2" -> "—" when real) */}
      {activeTab === 'actions' && (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
          <h3 className="font-headline-md text-headline-sm font-semibold text-on-surface pb-space-sm border-b border-surface-container-high/60">
            Action Item Tracker
          </h3>
          <div className="flex flex-col gap-3">
            {recommendedActionList.map((action, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-surface-container">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded border border-primary text-primary flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <span className="font-semibold text-on-surface">
                      {hasRealInvestigation ? action.title : <DemoValue real={null} demo={action.title} />}
                    </span>
                    <p className="text-xs text-on-surface-variant">
                      {hasRealInvestigation ? action.subtext : <DemoValue real={null} demo={action.subtext} />}
                    </p>
                  </div>
                </div>
                <span
                  className="font-code-sm text-xs px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold cursor-help"
                  title={hasRealInvestigation ? 'Not provided by the investigation engine' : undefined}
                >
                  {hasRealInvestigation ? '—' : <DemoValue real={null} demo={action.priority} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom restart link */}
      <div className="flex justify-end pt-space-xs">
        <button
          onClick={onRestartInvestigation}
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer font-medium"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Start New Incident Investigation</span>
        </button>
      </div>
    </div>
  );
}
