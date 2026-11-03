import React, { useState } from 'react';
import { EVIDENCE_ITEMS, getEvidenceByCategory } from '../services/evidenceService';

export default function EvidenceDetails({ onBackToResults }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('E001');
  const [showLogModal, setShowLogModal] = useState(false);

  const categories = [
    { id: 'All', label: 'All (10)' },
    { id: 'Metric', label: 'Metrics (4)' },
    { id: 'Log', label: 'Logs (3)' },
    { id: 'Trace', label: 'Traces (2)' },
    { id: 'Deployment', label: 'Deployments (1)' },
    { id: 'Dependency', label: 'Dependencies (1)' }
  ];

  const filteredItems = getEvidenceByCategory(activeCategory);
  const selectedItem = EVIDENCE_ITEMS.find(e => e.id === selectedEvidenceId) || EVIDENCE_ITEMS[0];

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(EVIDENCE_ITEMS, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "root-iq-evidence-inc-001.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Bar matching screen_c2eb72ed.png */}
      <div className="flex flex-col gap-space-sm pb-space-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBackToResults}
            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary hover:text-surface-tint transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to Results</span>
          </button>

          <button
            type="button"
            onClick={handleExportAudit}
            className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-headline-sm text-headline-sm shadow-xs transition-all border border-surface-container-high/60 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Evidence</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between mt-space-xs">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Evidence Details
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Correlated telemetry and findings for INC-001
            </p>
          </div>
        </div>
      </div>

      {/* Filter Category Navigation Tabs */}
      <div className="flex items-center gap-space-sm overflow-x-auto pb-space-sm pt-space-xs select-none no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-space-md py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container shadow-xs border border-surface-container-high/40'
              }`}
              type="button"
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl mt-space-lg items-start">
        {/* Left Column: Master Evidence List (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-space-sm">
          {filteredItems.map((item) => {
            const isSelected = selectedEvidenceId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedEvidenceId(item.id)}
                className={`group relative flex items-center justify-between p-space-md rounded-xl shadow-xs transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-primary/50 bg-surface-container-lowest shadow-sm'
                    : 'border-surface-container-high/40 bg-surface-container-lowest hover:border-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-space-md min-w-0 pr-space-sm">
                  <span className="font-code-sm text-code-sm font-semibold text-primary px-2 py-1 rounded bg-blue-50">
                    {item.id}
                  </span>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold bg-surface-container text-primary">
                    {item.category}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      {item.title}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-space-lg shrink-0 pl-space-xs">
                  <span className="font-code-sm text-code-sm text-on-surface-variant hidden sm:inline">
                    {item.displayTime}
                  </span>
                  <button
                    type="button"
                    className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all font-semibold ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container-high/50'
                    }`}
                  >
                    Inspect
                  </button>
                </div>
              </div>
            );
          })}

          {/* Bottom Summary Banner matching screen_c2eb72ed.png */}
          <div className="mt-space-sm p-space-md rounded-xl bg-surface-container-low flex items-center justify-between text-on-surface-variant border border-surface-container-high/40 flex-wrap gap-2">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">info</span>
              <span className="font-body-sm text-body-sm">
                10 telemetry artifacts correlated across 6 pods
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold">
              100% Correlated
            </span>
          </div>
        </div>

        {/* Right Column: Evidence Inspection Card matching screen_c2eb72ed.png */}
        <div className="xl:col-span-5 flex flex-col gap-space-md">
          {/* Primary Inspection Container */}
          <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-lg border border-surface-container-high/40">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Evidence {selectedItem.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-primary font-label-sm text-label-sm font-semibold border border-blue-100">
                    Primary Symptom
                  </span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface-variant font-normal mt-0.5">
                  {selectedItem.shortTitle}
                </span>
              </div>
              <button
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                title="Expand Graph"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">open_in_full</span>
              </button>
            </div>

            {/* Telemetry Time Series Chart Container */}
            <div className="flex flex-col bg-surface-bright rounded-xl p-space-md relative overflow-hidden border border-surface-container-high/40">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Latency Duration (ms)
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  10s intervals
                </span>
              </div>

              {/* Inline Custom SVG Chart */}
              <div className="relative w-full h-56 flex items-center">
                {/* Left Y-Axis Labels */}
                <div className="flex flex-col justify-between h-44 text-right pr-2 select-none shrink-0 font-code-sm text-code-sm text-on-surface-variant">
                  <span>2,000</span>
                  <span>1,000</span>
                  <span>0</span>
                </div>

                {/* Chart Plot Area */}
                <div className="relative flex-1 h-44">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="w-full h-px bg-surface-container-high"></div>
                    <div className="w-full h-px bg-surface-container-high"></div>
                    <div className="w-full h-px bg-surface-container-high"></div>
                  </div>

                  {/* Vertical Spike Guide */}
                  <div className="absolute top-0 bottom-0 left-[72%] w-px bg-primary/40 pointer-events-none"></div>

                  {/* Main SVG Spark Area / Path */}
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 160">
                    <defs>
                      <linearGradient id="latencyGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
                        <stop offset="60%" stopColor="#2563eb" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 115 C 35 110, 50 120, 80 112 C 110 105, 130 118, 160 105 C 190 92, 210 50, 230 16 C 250 48, 275 75, 320 62 L 320 160 L 0 160 Z"
                      fill="url(#latencyGradient)"
                    />
                    <path
                      d="M 0 115 C 35 110, 50 120, 80 112 C 110 105, 130 118, 160 105 C 190 92, 210 50, 230 16 C 250 48, 275 75, 320 62"
                      fill="none"
                      stroke="#2563eb"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                    <circle className="animate-pulse" cx="230" cy="16" fill="#2563eb" r="4.5" />
                    <circle cx="230" cy="16" fill="#2563eb" fillOpacity="0.25" r="8" />
                  </svg>

                  {/* Peak Tooltip Badge Overlaid on Peak Coordinate */}
                  <div className="absolute left-[72%] top-[6%] -translate-x-1/2 -translate-y-full mb-1">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-inverse-surface text-inverse-on-surface shadow-md">
                      <span className="font-code-sm text-code-sm font-bold tracking-tight">1800 ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom X-Axis Timestamps */}
              <div className="flex items-center justify-between pl-10 pr-2 pt-space-xs font-code-sm text-code-sm text-on-surface-variant select-none">
                <span>10:00</span>
                <span>10:10</span>
                <span className="font-bold text-on-surface">10:20</span>
                <span>10:30</span>
              </div>
            </div>

            {/* Metric Metadata Details Table matching screen_c2eb72ed.png */}
            <div className="grid grid-cols-1 divide-y divide-surface-container-high/40 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-on-surface-variant">Service</span>
                <span className="font-semibold text-on-surface">payment-service</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-on-surface-variant">Timestamp</span>
                <span className="font-code-sm text-code-sm text-on-surface">Oct 28, 10:20 AM UTC</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-on-surface-variant">Source</span>
                <span className="font-code-sm text-code-sm text-on-surface">synthetic_metrics</span>
              </div>
            </div>

            {/* Associated Hypothesis Callout matching screen_c2eb72ed.png */}
            <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-xs border border-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                  ASSOCIATED HYPOTHESIS
                </span>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-blue-50 text-primary font-bold border border-blue-200">
                  Rank #1
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                Supports <span className="font-semibold text-primary">Hypothesis 1: Database connection pool exhaustion</span>. Correlates with v1.8.3 rollout.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-space-sm pt-space-xs">
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-all font-headline-sm text-headline-sm flex items-center justify-center gap-1.5 cursor-pointer border border-surface-container-high/60 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Adjust Range</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="flex-1 py-2 rounded-lg bg-primary text-on-primary hover:bg-surface-tint transition-all font-headline-sm text-headline-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">find_in_page</span>
                <span>Query Logs</span>
              </button>
            </div>
          </div>

          {/* Quick AI Diagnostic Note Card matching screen_c2eb72ed.png */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex items-start gap-space-md border border-surface-container-high/40">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Copilot Insight
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                Latency surged abruptly to 1800ms within 90 seconds, correlating 99.4% with deployment commit <code className="font-code-sm text-code-sm text-on-surface font-bold">#9c0f4d1</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Query Logs Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl p-space-xl shadow-xl flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Log Query Window (10:19 – 10:22)</span>
              </div>
              <button onClick={() => setShowLogModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="bg-inverse-surface rounded-lg p-space-md text-surface font-code-sm text-code-sm overflow-x-auto leading-relaxed">
              <p className="text-surface-dim">10:18:42 [INFO] HikariPool-1 - Connection pool size set to 20</p>
              <p className="text-error mt-1">10:19:15 [WARN] Connection timeout after 30000ms: pool exhausted (20/20 active, 142 queued)</p>
              <p className="text-error-container mt-1">10:20:02 [ERROR] org.postgresql.util.PSQLException: Cannot get a connection from the pool</p>
              <p className="text-surface-dim mt-1">10:20:10 [WARN] Upstream client timeout triggered for /v2/charge</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-space-lg py-1.5 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
