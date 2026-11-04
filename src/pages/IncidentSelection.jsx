import React, { useState, useEffect } from 'react';
import { fetchIncidents } from '../services/incidentService';
import { fetchEvidenceSummary } from '../services/evidenceService';
import IncidentDetailsModal from '../components/IncidentDetailsModal';

export function formatUtcDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    }).format(d);
    return `${formatted} (UTC)`;
  } catch {
    return dateStr;
  }
}

export default function IncidentSelection({
  selectedIncident,
  isInvestigating = false,
  onSelectIncident,
  onRunInvestigation,
  onViewEvidence
}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evidenceSummary, setEvidenceSummary] = useState({ total: 0, bySourceType: {} });
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Fetch incidents list from Supabase on mount
  const loadIncidents = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchErr } = await fetchIncidents();
    if (fetchErr) {
      setError(fetchErr);
      setIncidents([]);
    } else {
      setIncidents(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // When selected incident changes, load real evidence summary from canonical_evidence
  useEffect(() => {
    if (!selectedIncident?.incident_id) {
      setEvidenceSummary({ total: 0, bySourceType: {} });
      return;
    }

    let isMounted = true;
    setLoadingEvidence(true);
    fetchEvidenceSummary(selectedIncident.incident_id).then(({ data, error: summaryErr }) => {
      if (!isMounted) return;
      if (summaryErr) {
        console.error('[RootIQ] Failed to load evidence summary:', summaryErr);
        setEvidenceSummary({ total: 0, bySourceType: {} });
      } else if (data) {
        setEvidenceSummary(data);
      }
      setLoadingEvidence(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedIncident?.incident_id]);

  const handleRun = () => {
    if (!selectedIncident || isInvestigating) return;
    onRunInvestigation(selectedIncident.incident_id);
  };

  const getSourceTypeDotColor = (index) => {
    const palette = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-error', 'bg-primary-container', 'bg-outline'];
    return palette[index % palette.length];
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-space-2xl max-w-6xl mx-auto w-full">
        {/* Header Context Area */}
        <div className="flex flex-col mb-2">
          <h1 className="text-2xl md:text-3xl lg:text-[32px] font-bold text-on-surface tracking-tight leading-tight">
            Select an incident to Investigate
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-normal mt-1">
            Choose from available synthetic incidents
          </p>
        </div>

        {/* Loading State for Supabase Incidents */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-space-2xl bg-surface-container-lowest rounded-xl border border-surface-container-high/40 min-h-[320px]">
            <span className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant mt-space-md">
              Connecting to Supabase incidents...
            </span>
          </div>
        )}

        {/* Error State for Supabase Connection / Queries */}
        {!loading && error && (
          <div className="flex flex-col items-center text-center p-space-2xl bg-surface-container-lowest rounded-xl border border-error/30 gap-space-md">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="flex flex-col gap-1 max-w-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Unable to load incidents from Supabase
              </h3>
              <p className="font-code-sm text-xs text-error bg-error-container/30 p-space-sm rounded-lg mt-1 break-all">
                {error.message || String(error)}
              </p>
            </div>
            <button
              onClick={loadIncidents}
              className="inline-flex items-center gap-1.5 px-space-xl py-space-sm rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-primary-container transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Retry Query</span>
            </button>
          </div>
        )}

        {/* Main Side-by-Side Dual Deck Layout */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* Left Primary Configuration Card (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-space-lg bg-surface-container-lowest p-space-2xl rounded-xl shadow-sm border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  ACTIVE INCIDENT CONTEXT
                </span>
                {selectedIncident && (
                  <span className="font-code-sm text-code-sm text-secondary bg-surface-container-low px-2 py-0.5 rounded">
                    {selectedIncident.environment || 'staging'}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-space-md">
                {/* Incident Selector Trigger Box */}
                <div
                  className="relative group cursor-pointer bg-surface rounded-xl p-space-lg hover:bg-surface-container-low transition-all border border-surface-container-high/40"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-md min-w-0">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedIncident ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">
                          {selectedIncident ? 'warning' : 'playlist_add_check'}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                            {selectedIncident ? selectedIncident.title : 'Select an incident'}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm truncate mt-0.5">
                          {selectedIncident ? (
                            <>
                              <span>{selectedIncident.affected_service}</span>
                              <span className="text-outline-variant">•</span>
                              <span className="text-error font-medium">{selectedIncident.severity} Severity</span>
                              <span className="text-outline-variant">•</span>
                              <span className="font-code-sm text-code-sm">{formatUtcDateTime(selectedIncident.start_time)}</span>
                            </>
                          ) : (
                            <span>{incidents.length} incident{incidents.length === 1 ? '' : 's'} available in database</span>
                          )}
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
                      className="flex flex-col gap-space-xs mt-space-md pt-space-md border-t border-surface-container-high/60 max-h-60 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {incidents.length === 0 ? (
                        <div className="p-space-md text-on-surface-variant text-sm text-center">
                          No incidents found in database.
                        </div>
                      ) : (
                        incidents.map((inc) => {
                          const isSelected = selectedIncident?.incident_id === inc.incident_id;
                          return (
                            <div
                              key={inc.incident_id}
                              onClick={() => {
                                onSelectIncident(inc);
                                setIsDropdownOpen(false);
                              }}
                              className={`p-space-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-surface-container-high/60'
                                  : 'hover:bg-surface-container-high/40 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <div className="flex items-center gap-space-sm min-w-0 pr-2">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    isSelected ? 'bg-primary' : 'bg-error'
                                  }`}
                                ></span>
                                <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                                  {inc.title}
                                </span>
                              </div>
                              <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0 font-medium px-2 py-0.5 rounded bg-surface-container">
                                {inc.severity || '—'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Secondary Row: View Incident Details Action Card */}
                <button
                  type="button"
                  onClick={() => selectedIncident && setIsModalOpen(true)}
                  disabled={!selectedIncident}
                  className="group flex items-center justify-between p-space-lg rounded-xl bg-surface hover:bg-surface-container-low transition-all text-left border border-surface-container-high/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={!selectedIncident || isInvestigating}
                  className="w-full flex items-center justify-center gap-space-md py-space-md px-space-xl rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-md text-headline-md shadow-md hover:shadow-lg transition-all active:scale-[0.99] group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isInvestigating ? (
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
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-semibold">
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
                      {selectedIncident ? selectedIncident.affected_service : '—'}
                    </span>
                  </div>
                </div>

                {/* Severity Row */}
                <div className="flex items-center justify-between py-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant w-28 shrink-0">
                    Severity
                  </span>
                  <div className="flex items-center gap-space-xs">
                    {selectedIncident?.severity ? (
                      <span className="inline-flex items-center gap-1.5 px-space-md py-0.5 rounded-full bg-error-container text-on-error-container font-headline-sm text-label-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                        {selectedIncident.severity}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
                  </div>
                </div>

                {/* Started At Row */}
                <div className="flex items-start justify-between py-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant w-28 shrink-0">
                    Started At
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="font-code-sm text-code-sm text-on-surface font-semibold">
                      {selectedIncident ? formatUtcDateTime(selectedIncident.start_time) : '—'}
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary">
                      Coordinated Universal Time (UTC)
                    </span>
                  </div>
                </div>

                {/* Additional Incident Details: Environment, Type, End Time */}
                <div className="flex items-start justify-between py-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant w-28 shrink-0">
                    Environment
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface">
                    {selectedIncident?.environment || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant w-28 shrink-0">
                    Type
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface capitalize">
                    {selectedIncident?.incident_type || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant w-28 shrink-0">
                    Ended At
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface">
                    {selectedIncident?.end_time ? formatUtcDateTime(selectedIncident.end_time) : '—'}
                  </span>
                </div>

                {/* Description Row (bound to summary; nullable -> show "—", never demo) */}
                <div className="flex flex-col gap-space-xs py-space-xs bg-surface-container-low p-space-md rounded-xl border border-surface-container">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                    DESCRIPTION
                  </span>
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                    {selectedIncident?.summary ? selectedIncident.summary : '—'}
                  </p>
                </div>

                {/* Flags Strip (synthetic_only, human_review_required, automated_remediation_allowed) */}
                {selectedIncident && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {selectedIncident.synthetic_only && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-primary font-code-sm text-[11px] font-semibold">
                        synthetic
                      </span>
                    )}
                    {selectedIncident.human_review_required && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-code-sm text-[11px] font-semibold border border-amber-200">
                        human review required
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-code-sm text-[11px] font-semibold">
                      {selectedIncident.automated_remediation_allowed ? 'auto remediation enabled' : 'no auto remediation'}
                    </span>
                  </div>
                )}
              </div>

              {/* Telemetry Mini Visualization Banner */}
              <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    PRE-INGESTED TELEMETRY
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface font-bold">
                    {loadingEvidence ? (
                      <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      `${evidenceSummary.total} Available Artifacts`
                    )}
                  </span>
                </div>

                {/* Dynamic Distribution Sparkline Visual based on real source_type counts */}
                <div className="w-full bg-surface-container-lowest rounded-lg p-space-sm flex flex-wrap gap-space-sm items-center min-h-[44px]">
                  {Object.keys(evidenceSummary.bySourceType).length === 0 ? (
                    <span className="text-xs text-on-surface-variant italic">
                      {selectedIncident ? 'No telemetry rows found' : 'Select an incident to view artifacts'}
                    </span>
                  ) : (
                    Object.entries(evidenceSummary.bySourceType).map(([sourceType, count], idx) => (
                      <div key={sourceType} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-xs ${getSourceTypeDotColor(idx)}`}></span>
                        <span className="font-code-sm text-code-sm text-on-surface capitalize">
                          {count} {sourceType}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Link Anchor */}
              <div className="pt-space-xs">
                <button
                  type="button"
                  disabled={!selectedIncident || evidenceSummary.total === 0}
                  onClick={onViewEvidence}
                  className="inline-flex items-center gap-space-xs font-headline-sm text-headline-sm text-primary hover:text-primary-container transition-colors py-1 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <span>View Related Evidence ({evidenceSummary.total} items)</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Raw Telemetry Payload */}
      <IncidentDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        incident={selectedIncident}
      />
    </div>
  );
}
