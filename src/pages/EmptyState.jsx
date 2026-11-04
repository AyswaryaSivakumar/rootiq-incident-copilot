import React, { useState, useEffect } from 'react';
import { fetchIncidents } from '../services/incidentService';
import { formatUtcDateTime } from './IncidentSelection';

export default function EmptyState({ onSelectIncident, onStartInvestigation }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchIncidents().then(({ data }) => {
      if (!isMounted) return;
      if (data) setIncidents(data);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full py-space-xl">
        <div className="relative w-full max-w-xl mx-auto flex flex-col items-center text-center px-space-xl py-space-2xl rounded-xl bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-surface-container-high/40">
          {/* Ambient subtle glow behind illustration */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-surface-container rounded-full blur-3xl opacity-60 pointer-events-none -z-10"></div>

          {/* Line-art Document with Magnifying Glass Illustration */}
          <div className="relative w-36 h-36 mb-space-xl flex items-center justify-center select-none">
            <div className="absolute inset-0 bg-surface-container-low rounded-2xl flex items-center justify-center border border-surface-container">
              <svg className="w-24 h-24 text-primary" fill="none" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                {/* Sheet / Document Base */}
                <path
                  d="M28 20C28 17.7909 29.7909 16 32 16H52L68 32V76C68 78.2091 66.2091 80 64 80H32C29.7909 80 28 78.2091 28 76V20Z"
                  fill="#EFF4FF"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
                {/* Dog-ear fold */}
                <path d="M52 16V32H68" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                {/* Document internal data lines */}
                <path d="M38 42H58" stroke="#94A3B8" strokeLinecap="round" strokeWidth="2" />
                <path d="M38 50H50" stroke="#94A3B8" strokeLinecap="round" strokeWidth="2" />
                <path d="M38 58H46" stroke="#CBD5E1" strokeLinecap="round" strokeWidth="2" />
                {/* Highlighting Lens / Magnifier */}
                <circle cx="58" cy="58" fill="#FFFFFF" r="14" stroke="#2563EB" strokeWidth="2.5" />
                {/* Lens reflection arc */}
                <path d="M52 54C53.5 52 56.5 50.5 60 51" stroke="#93C5FD" strokeLinecap="round" strokeWidth="2" />
                {/* Magnifier Handle */}
                <path d="M68 68L78 78" stroke="#2563EB" strokeLinecap="round" strokeWidth="3" />
              </svg>
            </div>

            {/* Floating subtle indicator pill badge */}
            <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full shadow-xs border border-surface-container">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-code-sm text-code-sm text-primary font-semibold">RCA Ready</span>
            </div>
          </div>

          {/* Typography */}
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs font-semibold">
            No Investigations Yet
          </h2>
          <p className="font-body-md text-body-md text-secondary max-w-sm mb-space-xl">
            Load an incident to get started with the automated Root Cause Analysis investigation.
          </p>

          {/* Primary Action CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-space-sm px-space-xl py-space-sm rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Select Incident</span>
          </button>

          {/* Contextual Quick-Links for Operational Awareness */}
          <div className="mt-space-2xl pt-space-lg w-full flex flex-col sm:flex-row items-center justify-center gap-space-lg border-t border-surface-container-high/40">
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
              <span>
                Avg. diagnosis time: <strong>~2 mins</strong>
              </span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-outline-variant"></div>
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">auto_graph</span>
              <span>
                Precision confidence score: <strong>98%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Real Incidents Picker Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl p-space-lg flex flex-col gap-space-md border border-surface-container animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">troubleshoot</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Available Incidents</span>
                </div>
                <button
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <p className="font-body-sm text-body-sm text-secondary">
                Select an active incident telemetry stream from Supabase to launch copilot root-cause extraction:
              </p>

              <div className="flex flex-col gap-space-xs overflow-y-auto max-h-60 pr-1">
                {loading ? (
                  <div className="p-4 text-center text-xs text-on-surface-variant">
                    <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></span>
                    Loading incidents from database...
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-on-surface-variant italic">
                    No incidents currently registered in database.
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div
                      key={inc.incident_id}
                      className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors border border-surface-container-high/40"
                      onClick={() => {
                        setIsModalOpen(false);
                        if (onStartInvestigation) onStartInvestigation(inc);
                      }}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                          {inc.title}
                        </span>
                        <span className="font-code-sm text-code-sm text-error font-medium truncate">
                          {inc.severity} Severity • {formatUtcDateTime(inc.start_time)}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0">arrow_forward</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-space-xs border-t border-surface-container-high/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onSelectIncident) onSelectIncident();
                  }}
                  className="text-primary hover:underline font-label-md text-label-md cursor-pointer font-medium"
                >
                  Go to Incident Selection page →
                </button>
                <button
                  className="px-space-md py-space-xs text-on-surface-variant font-label-md text-label-md hover:text-on-surface cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
