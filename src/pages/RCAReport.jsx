import React, { useState } from 'react';
import { RCA_REPORT_DATA } from '../services/investigationService';
import { EVIDENCE_ITEMS } from '../services/evidenceService';

export default function RCAReport({
  onRestartInvestigation,
  onViewEvidence
}) {
  const [activeTab, setActiveTab] = useState('summary');
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const report = RCA_REPORT_DATA;

  const handleDownload = (format = 'pdf') => {
    setIsDownloadOpen(false);
    let content = '';
    let filename = `RCA_Report_${report.incidentId}.${format}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
      mimeType = 'application/json';
    } else if (format === 'md') {
      content = `# Root Cause Analysis: ${report.incidentId}
**Primary Root Cause:** ${report.primaryRootCause}
**Confidence:** ${report.confidenceScore} (${report.confidence})

## Key Findings
${report.keyFindings.map(f => `- **${f.title}**: ${f.subtext}`).join('\n')}

## Recommended Actions
${report.recommendedActions.map(a => `- **${a.title}**: ${a.subtext}`).join('\n')}
`;
      mimeType = 'text/markdown';
    } else {
      content = `ROOTIQ POSTMORTEM REPORT - ${report.incidentId}\n\nPRIMARY ROOT CAUSE:\n${report.primaryRootCause}\n\nKEY FINDINGS:\n${report.keyFindings.map(f => `• ${f.title}: ${f.subtext}`).join('\n')}\n\nRECOMMENDED ACTIONS:\n${report.recommendedActions.map(a => `• ${a.title}: ${a.subtext}`).join('\n')}`;
      filename = `RCA_Report_${report.incidentId}.txt`;
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
      {/* Top Banner matching screen_c078b124.png */}
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
            INC-001 • RCA Report Ready
          </h1>
          <span className="text-on-surface-variant font-body-md text-sm">
            Resolved in production
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

      {/* Horizontal Interactive Tab Navigation matching screen_c078b124.png */}
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

      {/* Tab 1: Summary matching screen_c078b124.png */}
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
              Database connection pool capacity was reduced during deployment, contributing to database timeouts.
            </p>
          </div>

          {/* Two-Column Grid: Key Findings & Recommended Actions matching screen_c078b124.png */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {/* Left Column: Key Findings */}
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
                        {finding.title}
                      </span>
                      <span className="font-body-sm text-xs text-on-surface-variant">
                        {finding.subtext}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Recommended Actions */}
            <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between pb-space-md border-b border-surface-container-high/40">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
                  <h3 className="font-headline-md text-headline-sm font-semibold text-on-surface">Recommended Actions</h3>
                </div>
                <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  MITIGATIONS
                </span>
              </div>
              <div className="flex flex-col gap-space-md pt-space-md">
                {report.recommendedActions.map((action, idx) => (
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Evidence */}
      {activeTab === 'evidence' && (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
          <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high/60">
            <h3 className="font-headline-md text-headline-sm font-semibold text-on-surface">Referenced Evidence Dossier</h3>
            <button
              onClick={onViewEvidence}
              className="text-primary hover:underline font-label-md text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect in Evidence Details Explorer</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 divide-y divide-surface-container-high/50 font-body-sm text-body-sm">
            {EVIDENCE_ITEMS.slice(0, 6).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-code-sm text-code-sm font-bold text-primary bg-blue-50 px-2 py-0.5 rounded">
                    {item.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-semibold text-xs">
                    {item.category}
                  </span>
                  <span className="font-medium text-on-surface">{item.title}</span>
                </div>
                <span className="text-on-surface-variant text-xs">{item.timestamp}</span>
              </div>
            ))}
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
            <div className="relative pl-4">
              <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest"></span>
              <span className="font-code-sm text-xs text-primary font-bold">10:12 AM UTC</span>
              <p className="font-headline-sm text-sm text-on-surface font-semibold">Deployment v1.8.3 canary rolled out</p>
              <p className="text-on-surface-variant text-xs">Commit #9c0f4d1 adjusted HikariCP pool capacity to 20.</p>
            </div>
            <div className="relative pl-4">
              <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-error ring-4 ring-surface-container-lowest"></span>
              <span className="font-code-sm text-xs text-error font-bold">10:15 AM UTC</span>
              <p className="font-headline-sm text-sm text-on-surface font-semibold">p95 Latency surged past 1,000ms</p>
              <p className="text-on-surface-variant text-xs">Database client socket queue depth reached 142 waiting connections.</p>
            </div>
            <div className="relative pl-4">
              <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-surface-container-lowest"></span>
              <span className="font-code-sm text-xs text-emerald-600 font-bold">10:28 AM UTC</span>
              <p className="font-headline-sm text-sm text-on-surface font-semibold">RootIQ Causal Engine identified root cause</p>
              <p className="text-on-surface-variant text-xs">Approved by Incident Commander Ayswarya with 82% confidence score.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Actions */}
      {activeTab === 'actions' && (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
          <h3 className="font-headline-md text-headline-sm font-semibold text-on-surface pb-space-sm border-b border-surface-container-high/60">
            Action Item Tracker
          </h3>
          <div className="flex flex-col gap-3">
            {report.recommendedActions.map((action, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-surface-container">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded border border-primary text-primary flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <span className="font-semibold text-on-surface">{action.title}</span>
                    <p className="text-xs text-on-surface-variant">{action.subtext}</p>
                  </div>
                </div>
                <span className="font-code-sm text-xs px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold">
                  {action.priority}
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
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Start New Incident Investigation</span>
        </button>
      </div>
    </div>
  );
}
