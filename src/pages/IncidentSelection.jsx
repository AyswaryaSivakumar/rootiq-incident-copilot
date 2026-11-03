import React, { useState } from 'react';
import { SYNTHETIC_INCIDENT, ALL_INCIDENTS } from '../services/incidentService';
import IncidentDetailsModal from '../components/IncidentDetailsModal';

export default function IncidentSelection({ onRunInvestigation, onViewEvidence }) {
  const [selectedIncident, setSelectedIncident] = useState(SYNTHETIC_INCIDENT);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      onRunInvestigation(selectedIncident.id);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-space-2xl max-w-6xl mx-auto w-full">
        {/* Header Context Area matching screen.png */}
        <div className="flex flex-col mb-2">
          <h1 className="text-2xl md:text-3xl lg:text-[32px] font-bold text-on-surface tracking-tight leading-tight">
            Select an incident to Investigate
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-normal mt-1">
            Choose from available synthetic incidents
          </p>
        </div>

        {/* Main Side-by-Side Dual Deck Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Primary Configuration Card (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg bg-surface-container-lowest p-space-2xl rounded-xl shadow-sm border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                ACTIVE INCIDENT CONTEXT
              </span>
            </div>

            <div className="flex flex-col gap-space-md">
              {/* Incident Selector Trigger Box */}
              <div
                className="relative group cursor-pointer bg-surface rounded-xl p-space-lg hover:bg-surface-container-low transition-all border border-surface-container-high/40"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px]">warning</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                          {selectedIncident.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm truncate mt-0.5">
                        <span>{selectedIncident.service}</span>
                        <span className="text-outline-variant">•</span>
                        <span className="text-error font-medium">{selectedIncident.severity} Severity</span>
                        <span className="text-outline-variant">•</span>
                        <span className="font-code-sm text-code-sm">{selectedIncident.startedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors shrink-0">
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                      keyboard_arrow_down
                    </span>
                  </div>
                </div>

                {/* Expandable incident selector drawer */}
                {isDropdownOpen && (
                  <div
                    className="flex flex-col gap-space-xs mt-space-md pt-space-md border-t border-surface-container-high/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ALL_INCIDENTS.map((inc) => {
                      const isSelected = inc.id === selectedIncident.id;
                      return (
                        <div
                          key={inc.id}
                          onClick={() => {
                            setSelectedIncident(inc);
                            setIsDropdownOpen(false);
                          }}
                          className={`p-space-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-surface-container-high/60'
                              : 'hover:bg-surface-container-high/40 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-space-sm">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-primary' : inc.status === 'Archived' ? 'bg-error' : 'bg-secondary'
                              }`}
                            ></span>
                            <span className="font-headline-sm text-headline-sm text-on-surface">
                              {inc.title}
                            </span>
                          </div>
                          <span className={`font-label-sm text-label-sm ${isSelected ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                            {isSelected ? 'Selected' : inc.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Secondary Row: View Incident Details Action Card */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center justify-between p-space-lg rounded-xl bg-surface hover:bg-surface-container-low transition-all text-left border border-surface-container-high/30 cursor-pointer"
              >
                <div className="flex items-center gap-space-md">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                      View Incident Details
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Inspect raw PagerDuty payload, Slack thread timeline, and initial alert triage
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant group-hover:translate-x-1 group-hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </div>
              </button>
            </div>

            {/* Primary Launch Action */}
            <div className="pt-space-xs">
              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-space-md py-space-md px-space-xl rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-md text-headline-md shadow-md hover:shadow-lg transition-all active:scale-[0.99] group cursor-pointer disabled:opacity-80"
              >
                {isRunning ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Initiating Causal Analysis...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                      play_arrow
                    </span>
                    <span>Run Investigation</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1.5">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Summary & Telemetry Metadata Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg bg-surface-container-lowest p-space-2xl rounded-xl shadow-sm border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                Incident Summary
              </h2>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">analytics</span>
              </div>
            </div>

            {/* Analytical Key-Value Spec Sheet */}
            <div className="flex flex-col gap-space-md">
              {/* Service Row */}
              <div className="flex items-start justify-between py-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface-variant w-28 shrink-0">
                  Service
                </span>
                <div className="flex items-center gap-space-xs justify-end flex-wrap text-right">
                  <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-md bg-surface-container-low font-code-sm text-code-sm text-primary font-medium">
                    <span className="material-symbols-outlined text-[14px]">dns</span>
                    {selectedIncident.service}
                  </span>
                </div>
              </div>

              {/* Severity Row */}
              <div className="flex items-center justify-between py-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface-variant w-28 shrink-0">
                  Severity
                </span>
                <div className="flex items-center gap-space-xs">
                  <span className="inline-flex items-center gap-1.5 px-space-md py-0.5 rounded-full bg-error-container text-on-error-container font-headline-sm text-label-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                    {selectedIncident.severity}
                  </span>
                </div>
              </div>

              {/* Started At Row */}
              <div className="flex items-start justify-between py-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface-variant w-28 shrink-0">
                  Started At
                </span>
                <div className="flex flex-col items-end">
                  <span className="font-code-sm text-code-sm text-on-surface font-semibold">
                    {selectedIncident.startedAt}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">
                    Coordinated Universal Time (UTC)
                  </span>
                </div>
              </div>

              {/* Description Row matching screen_807fbdc3.png */}
              <div className="flex flex-col gap-space-xs py-space-xs bg-surface-container-low p-space-md rounded-xl border border-surface-container">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                  DESCRIPTION
                </span>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  Payment API p95 latency increased after deployment.
                </p>
              </div>
            </div>

            {/* Telemetry Mini Visualization Banner */}
            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  PRE-INGESTED TELEMETRY
                </span>
                <span className="font-code-sm text-code-sm text-on-surface font-bold">
                  {selectedIncident.telemetrySummary.total} Available Artifacts
                </span>
              </div>

              {/* Inline Distribution Sparkline Visual */}
              <div className="w-full bg-surface-container-lowest rounded-lg p-space-sm grid grid-cols-2 sm:grid-cols-4 gap-space-sm sm:gap-space-xs items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-primary"></span>
                  <span className="font-code-sm text-code-sm text-on-surface">4 Metrics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-tertiary"></span>
                  <span className="font-code-sm text-code-sm text-on-surface">3 Logs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-secondary"></span>
                  <span className="font-code-sm text-code-sm text-on-surface">2 Traces</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-error"></span>
                  <span className="font-code-sm text-code-sm text-on-surface">1 Deploy</span>
                </div>
              </div>
            </div>

            {/* Bottom Link Anchor */}
            <div className="pt-space-xs">
              <button
                type="button"
                onClick={onViewEvidence}
                className="inline-flex items-center gap-space-xs font-headline-sm text-headline-sm text-primary hover:text-primary-container transition-colors py-1 group cursor-pointer"
              >
                <span>View Related Evidence (10 items)</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Raw Telemetry Payload */}
      <IncidentDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
