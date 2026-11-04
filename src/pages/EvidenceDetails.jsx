import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchEvidenceForIncident,
  fetchRawTelemetryBySourceRecord
} from '../services/evidenceService';
import { formatUtcDateTime } from './IncidentSelection';
import DemoValue from '../components/DemoValue';
import { DEMO_EVIDENCE_FILLERS } from '../demo/demoData';
import { SHOW_DEMO_FILLERS } from '../demo/demoConfig';
import { getEvidenceLinks } from '../services/hypothesisUtils';

export default function EvidenceDetails({
  incident,
  investigationOutput,
  hypotheses: rawHypotheses,
  evidenceIndex: rawEvidenceIndex,
  selectedEvidenceId: propSelectedEvidenceId,
  onSelectEvidenceId,
  onBackToResults,
  onSelectIncident
}) {
  const hypotheses = Array.isArray(rawHypotheses) ? rawHypotheses : [];
  const evidenceIndex = rawEvidenceIndex || new Map();
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(propSelectedEvidenceId);
  const [showLogModal, setShowLogModal] = useState(false);
  const [rawLogs, setRawLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [viewJsonObservation, setViewJsonObservation] = useState(false);

  // Sync prop changes for selectedEvidenceId
  useEffect(() => {
    if (propSelectedEvidenceId) {
      setSelectedEvidenceId(propSelectedEvidenceId);
    }
  }, [propSelectedEvidenceId]);

  // Load real evidence rows from Supabase
  const loadEvidence = async () => {
    if (!incident?.incident_id) {
      setEvidenceList([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchErr } = await fetchEvidenceForIncident(incident.incident_id);
    if (fetchErr) {
      setError(fetchErr);
      setEvidenceList([]);
    } else {
      const items = data || [];
      setEvidenceList(items);
      if (items.length > 0) {
        if (propSelectedEvidenceId && items.some(e => e.evidence_id === propSelectedEvidenceId)) {
          setSelectedEvidenceId(propSelectedEvidenceId);
        } else if (!selectedEvidenceId) {
          setSelectedEvidenceId(items[0].evidence_id);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvidence();
  }, [incident?.incident_id]);

  // Compute distinct category tabs from real source_type values
  const categories = useMemo(() => {
    const counts = {};
    evidenceList.forEach((e) => {
      const type = e.source_type || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });

    const list = [{ id: 'All', label: `All (${evidenceList.length})` }];
    Object.entries(counts).forEach(([sourceType, count]) => {
      list.push({ id: sourceType, label: `${sourceType} (${count})` });
    });
    return list;
  }, [evidenceList]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return evidenceList;
    return evidenceList.filter((e) => e.source_type === activeCategory);
  }, [evidenceList, activeCategory]);

  const selectedIndex = evidenceList.findIndex((e) => e.evidence_id === selectedEvidenceId);
  const selectedItem = evidenceList[selectedIndex >= 0 ? selectedIndex : 0] || null;

  // Stable index-based demo fallback filler
  const demoFiller = selectedIndex >= 0
    ? DEMO_EVIDENCE_FILLERS[selectedIndex % DEMO_EVIDENCE_FILLERS.length]
    : DEMO_EVIDENCE_FILLERS[0];

  const hasRealInvestigation = Boolean(investigationOutput && Array.isArray(hypotheses) && hypotheses.length > 0);

  // Map of hypotheses by rank
  const hypothesisByRank = useMemo(() => {
    const map = new Map();
    hypotheses.forEach(h => map.set(h.rank, h));
    return map;
  }, [hypotheses]);

  // Real bidirectional links for the currently selected evidence
  const selectedLinks = useMemo(() => {
    if (!hasRealInvestigation || !selectedItem?.evidence_id) return null;
    return getEvidenceLinks(selectedItem.evidence_id, hypotheses);
  }, [hasRealInvestigation, selectedItem?.evidence_id, hypotheses]);

  // Multi-line association descriptions for Associated Hypothesis callout
  const associatedHypothesisLines = useMemo(() => {
    if (!selectedLinks) return [];
    const lines = [];

    selectedLinks.supports.forEach((rank) => {
      const h = hypothesisByRank.get(rank);
      lines.push({
        type: 'support',
        badge: `Rank #${rank} Match`,
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: `Supports Hypothesis ${rank}: ${h?.hypothesis || 'Causal factor'}`
      });
    });

    selectedLinks.contradicts.forEach((rank) => {
      const h = hypothesisByRank.get(rank);
      lines.push({
        type: 'contradict',
        badge: 'Contradiction',
        badgeColor: 'bg-error-container text-error border-error/20',
        text: `Contradicts Hypothesis ${rank}: ${h?.hypothesis || 'Causal factor'}`
      });
    });

    selectedLinks.cited.forEach((rank) => {
      const h = hypothesisByRank.get(rank);
      lines.push({
        type: 'cited',
        badge: 'Referenced',
        badgeColor: 'bg-surface-container text-on-surface-variant border-surface-container-high',
        text: `Referenced in Hypothesis ${rank}: ${h?.hypothesis || 'Causal factor'}`
      });
    });

    if (lines.length === 0) {
      lines.push({
        type: 'none',
        badge: 'Not linked',
        badgeColor: 'bg-surface-container text-on-surface-variant border-surface-container-high',
        text: 'Not linked to any hypothesis'
      });
    }

    return lines;
  }, [selectedLinks, hypothesisByRank]);

  // Load raw telemetry when query logs modal is opened
  const handleOpenLogModal = async () => {
    setShowLogModal(true);
    if (!selectedItem?.source_record_id || !incident?.incident_id) {
      setRawLogs([]);
      return;
    }
    setLoadingLogs(true);
    const { data, error: logErr } = await fetchRawTelemetryBySourceRecord(
      incident.incident_id,
      selectedItem.source_record_id
    );
    if (logErr) {
      console.error('[RootIQ] Failed to load raw logs:', logErr);
      setRawLogs([]);
    } else {
      setRawLogs(data || []);
    }
    setLoadingLogs(false);
  };

  // Export audit downloads real fetched rows only
  const handleExportAudit = () => {
    if (!incident || evidenceList.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(evidenceList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `root-iq-evidence-${incident.incident_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Generate a short preview of observation JSON
  const getObservationPreview = (obs) => {
    if (!obs || typeof obs !== 'object') return '—';
    const entries = Object.entries(obs).filter(([_, v]) => typeof v !== 'object' && v !== null);
    if (entries.length === 0) {
      const keys = Object.keys(obs);
      return keys.length > 0 ? keys.slice(0, 3).map(k => `${k}: [data]`).join(' • ') : '—';
    }
    return entries.slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' • ');
  };

  // Check if observation contains numeric time series
  const hasRealTimeSeries = Boolean(
    selectedItem?.observation?.timeSeries ||
    selectedItem?.observation?.series ||
    (Array.isArray(selectedItem?.observation?.points) && selectedItem.observation.points.length > 0)
  );

  // Fallback state if no incident is selected
  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-surface-container-lowest rounded-xl p-space-2xl border border-surface-container-high/40 text-center gap-space-md max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[26px]">find_in_page</span>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
            No Incident Selected
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Please choose an incident on the Incident Selection page to inspect correlated telemetry artifacts.
          </p>
        </div>
        <button
          onClick={onSelectIncident}
          className="inline-flex items-center gap-2 px-space-xl py-space-sm rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-primary-container transition-all cursor-pointer font-semibold"
          type="button"
        >
          <span>Go to Incident Selection</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Top Bar matching approved Stitch screen */}
      <div className="flex flex-col gap-space-sm pb-space-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBackToResults}
            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary hover:text-surface-tint transition-colors group cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to Results</span>
          </button>

          <button
            type="button"
            onClick={handleExportAudit}
            disabled={evidenceList.length === 0}
            className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-headline-sm text-headline-sm shadow-xs transition-all border border-surface-container-high/60 cursor-pointer disabled:opacity-50 font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Evidence ({evidenceList.length})</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between mt-space-xs">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              Evidence Details
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Correlated telemetry and findings for {incident.incident_id}
            </p>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex items-center justify-center p-space-2xl bg-surface-container-lowest rounded-xl border border-surface-container min-h-[300px]">
          <span className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span className="font-headline-sm text-headline-sm text-on-surface-variant ml-3">
            Loading canonical evidence from Supabase...
          </span>
        </div>
      )}

      {!loading && error && (
        <div className="p-space-xl bg-surface-container-lowest rounded-xl border border-error/30 flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">error</span>
          </div>
          <p className="font-code-sm text-xs text-error max-w-lg break-all">
            {error.message || String(error)}
          </p>
          <button
            onClick={loadEvidence}
            className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-headline-sm text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Category Navigation Tabs */}
      {!loading && !error && (
        <>
          <div className="flex items-center gap-space-sm overflow-x-auto pb-space-sm pt-space-xs select-none no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-space-md py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all cursor-pointer whitespace-nowrap capitalize ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-xs font-semibold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container shadow-xs border border-surface-container-high/40 font-medium'
                  }`}
                  type="button"
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {evidenceList.length === 0 ? (
            <div className="p-space-2xl bg-surface-container-lowest rounded-xl border border-surface-container-high/40 text-center text-on-surface-variant my-6">
              No evidence records found for incident {incident.incident_id} in canonical_evidence table.
            </div>
          ) : (
            /* Main Split Layout */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl mt-space-lg items-start">
              {/* Left Column: Master Evidence List (7 cols) */}
              <div className="xl:col-span-7 flex flex-col gap-space-sm">
                {filteredItems.map((item, idx) => {
                  const isSelected = selectedItem?.evidence_id === item.evidence_id;
                  const itemLinks = hasRealInvestigation
                    ? getEvidenceLinks(item.evidence_id, hypotheses)
                    : null;

                  return (
                    <div
                      key={item.evidence_id}
                      onClick={() => {
                        setSelectedEvidenceId(item.evidence_id);
                        if (onSelectEvidenceId) onSelectEvidenceId(item.evidence_id);
                      }}
                      className={`group relative flex items-center justify-between p-space-md rounded-xl shadow-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-primary/50 bg-surface-container-lowest shadow-sm'
                          : 'border-surface-container-high/40 bg-surface-container-lowest hover:border-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center gap-space-md min-w-0 pr-space-sm">
                        <span className="font-code-sm text-code-sm font-semibold text-primary px-2 py-1 rounded bg-blue-50 shrink-0">
                          {item.evidence_id}
                        </span>
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold bg-surface-container text-primary shrink-0 capitalize">
                          {item.source_type}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                              {item.source_type} · {item.service}
                            </span>
                            {/* Small badge showing supporting or contradictory relationship */}
                            {itemLinks && itemLinks.supports.length > 0 && (
                              <span className="font-code-sm text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Rank #{itemLinks.supports[0]} Match
                              </span>
                            )}
                            {itemLinks && itemLinks.contradicts.length > 0 && (
                              <span className="font-code-sm text-[10px] font-semibold px-1.5 py-0.2 rounded bg-error-container text-error border border-error/20">
                                Contradiction
                              </span>
                            )}
                            {itemLinks && itemLinks.cited.length > 0 && itemLinks.supports.length === 0 && itemLinks.contradicts.length === 0 && (
                              <span className="font-code-sm text-[10px] font-semibold px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant border border-surface-container-high">
                                Referenced
                              </span>
                            )}
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                            {getObservationPreview(item.observation)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-space-lg shrink-0 pl-space-xs">
                        <span className="font-code-sm text-code-sm text-on-surface-variant hidden sm:inline">
                          {item.event_timestamp ? formatUtcDateTime(item.event_timestamp) : '—'}
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

                {/* Bottom Summary Banner */}
                <div className="mt-space-sm p-space-md rounded-xl bg-surface-container-low flex items-center justify-between text-on-surface-variant border border-surface-container-high/40 flex-wrap gap-2">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                    <span className="font-body-sm text-body-sm">
                      {evidenceList.length} telemetry artifact{evidenceList.length === 1 ? '' : 's'} ingested for {incident.incident_id}
                    </span>
                  </div>
                  {SHOW_DEMO_FILLERS && (
                    <span
                      className="font-label-sm text-label-sm text-primary font-bold underline decoration-dashed decoration-1 underline-offset-4 decoration-current/40"
                      title="Demo data, not from Supabase"
                      data-demo="true"
                    >
                      100% Correlated
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Evidence Inspection Card */}
              {selectedItem && (
                <div className="xl:col-span-5 flex flex-col gap-space-md">
                  {/* Primary Inspection Container */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-lg border border-surface-container-high/40">
                    {/* Header Section */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                            Evidence {selectedItem.evidence_id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-primary font-label-sm text-label-sm font-semibold border border-blue-100">
                            {selectedItem.quality_status || 'Ingested'}
                          </span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface-variant font-normal mt-0.5">
                          <DemoValue real={null} demo={demoFiller.shortTitle} />
                        </span>
                      </div>
                    </div>

                    {/* Telemetry Time Series Chart Container */}
                    <div className="flex flex-col bg-surface-bright rounded-xl p-space-md relative overflow-hidden border border-surface-container-high/40">
                      <div className="flex items-center justify-between mb-space-sm">
                        <div className="flex items-center gap-space-xs">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            Telemetry Trend
                          </span>
                        </div>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">
                          <DemoValue real={null} demo="10s intervals" />
                        </span>
                      </div>

                      {/* SVG Chart Plot */}
                      <div className="relative w-full h-56 flex items-center">
                        <div className="flex flex-col justify-between h-44 text-right pr-2 select-none shrink-0 font-code-sm text-code-sm text-on-surface-variant">
                          <span>2,000</span>
                          <span>1,000</span>
                          <span>0</span>
                        </div>

                        <div className="relative flex-1 h-44">
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                            <div className="w-full h-px bg-surface-container-high"></div>
                            <div className="w-full h-px bg-surface-container-high"></div>
                            <div className="w-full h-px bg-surface-container-high"></div>
                          </div>

                          <div className="absolute top-0 bottom-0 left-[72%] w-px bg-primary/40 pointer-events-none"></div>

                          {/* Chart SVG */}
                          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 160">
                            <defs>
                              <linearGradient id="latencyGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                <stop offset="60%" stopColor="#2563eb" stopOpacity="0.05" />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {SHOW_DEMO_FILLERS && (
                              <>
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
                                  strokeDasharray={hasRealTimeSeries ? undefined : '4 3'}
                                  strokeOpacity={hasRealTimeSeries ? 1 : 0.7}
                                />
                                <circle className="animate-pulse" cx="230" cy="16" fill="#2563eb" r="4.5" />
                              </>
                            )}
                          </svg>

                          {SHOW_DEMO_FILLERS && (
                            <div className="absolute left-[72%] top-[6%] -translate-x-1/2 -translate-y-full mb-1">
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-inverse-surface text-inverse-on-surface shadow-md">
                                <span className="font-code-sm text-code-sm font-bold tracking-tight">
                                  <DemoValue real={null} demo={demoFiller.peakValue} />
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pl-10 pr-2 pt-space-xs font-code-sm text-code-sm text-on-surface-variant select-none">
                        <span>10:00</span>
                        <span>10:10</span>
                        <span className="font-bold text-on-surface">10:20</span>
                        <span>10:30</span>
                      </div>
                    </div>

                    {/* Metric Metadata Details Table (Bound to Real Supabase columns) */}
                    <div className="grid grid-cols-1 divide-y divide-surface-container-high/40 text-sm">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-on-surface-variant">Evidence ID</span>
                        <span className="font-code-sm font-semibold text-primary">{selectedItem.evidence_id}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-on-surface-variant">Service</span>
                        <span className="font-semibold text-on-surface">{selectedItem.service}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-on-surface-variant">Source Type</span>
                        <span className="font-code-sm text-code-sm text-on-surface capitalize">{selectedItem.source_type}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-on-surface-variant">Timestamp</span>
                        <span className="font-code-sm text-code-sm text-on-surface">
                          {selectedItem.event_timestamp ? formatUtcDateTime(selectedItem.event_timestamp) : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-on-surface-variant">Quality Status</span>
                        <span className="font-code-sm text-code-sm font-medium text-primary">
                          {selectedItem.quality_status || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Observation JSON View Toggle & Generic Key/Value Table */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-surface-container-high/40">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                          Observation Payload
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewJsonObservation(!viewJsonObservation)}
                          className="font-code-sm text-xs text-primary hover:underline cursor-pointer"
                        >
                          {viewJsonObservation ? 'View Table' : 'View JSON'}
                        </button>
                      </div>

                      {viewJsonObservation ? (
                        <pre className="bg-surface-container-low p-space-sm rounded-lg text-xs font-code-sm text-on-surface overflow-x-auto max-h-48 border border-surface-container">
                          {JSON.stringify(selectedItem.observation, null, 2)}
                        </pre>
                      ) : (
                        <div className="bg-surface-container-low rounded-lg p-space-sm divide-y divide-surface-container-high/40 text-xs font-code-sm max-h-48 overflow-y-auto border border-surface-container">
                          {selectedItem.observation && typeof selectedItem.observation === 'object' && Object.keys(selectedItem.observation).length > 0 ? (
                            Object.entries(selectedItem.observation).map(([k, v]) => (
                              <div key={k} className="flex justify-between py-1 gap-2">
                                <span className="text-secondary font-medium shrink-0">{k}:</span>
                                <span className="text-right text-on-surface break-all">
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-on-surface-variant italic">—</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Limitations (jsonb rendered as list or "—") */}
                    <div className="flex flex-col gap-1 pt-1 border-t border-surface-container-high/40">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                        Limitations
                      </span>
                      {selectedItem.limitations ? (
                        Array.isArray(selectedItem.limitations) ? (
                          <ul className="list-disc pl-4 text-xs text-on-surface space-y-0.5">
                            {selectedItem.limitations.map((lim, i) => (
                              <li key={i}>{typeof lim === 'object' ? JSON.stringify(lim) : String(lim)}</li>
                            ))}
                          </ul>
                        ) : typeof selectedItem.limitations === 'object' && Object.keys(selectedItem.limitations).length > 0 ? (
                          <pre className="bg-surface-container-low p-2 rounded text-xs font-code-sm text-on-surface overflow-x-auto">
                            {JSON.stringify(selectedItem.limitations, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-xs text-on-surface">{String(selectedItem.limitations)}</span>
                        )
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </div>

                    {/* Associated Hypothesis Callout (Real when investigation exists, demo when not) */}
                    {hasRealInvestigation ? (
                      <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-xs border border-surface-container">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                            ASSOCIATED HYPOTHESIS
                          </span>
                          <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold border ${associatedHypothesisLines[0]?.badgeColor}`}>
                            {associatedHypothesisLines[0]?.badge}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-1">
                          {associatedHypothesisLines.map((line, idx) => (
                            <p key={idx} className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                              {line.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : SHOW_DEMO_FILLERS ? (
                      <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-xs border border-surface-container">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                            ASSOCIATED HYPOTHESIS
                          </span>
                          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-blue-50 text-primary font-bold border border-blue-200">
                            <DemoValue real={null} demo={demoFiller.matchedRank} />
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                          <DemoValue real={null} demo={demoFiller.associatedHypothesis} />
                        </p>
                      </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-space-sm pt-space-xs">
                      <button
                        type="button"
                        onClick={handleOpenLogModal}
                        className="w-full py-2 rounded-lg bg-primary text-on-primary hover:bg-surface-tint transition-all font-headline-sm text-headline-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer font-semibold"
                      >
                        <span className="material-symbols-outlined text-[18px]">find_in_page</span>
                        <span>Query Raw Telemetry Logs</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick AI Diagnostic Note Card */}
                  {SHOW_DEMO_FILLERS && (
                    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex items-start gap-space-md border border-surface-container-high/40">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Copilot Insight
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                          {hasRealInvestigation ? (
                            <DemoValue
                              real={null}
                              demo="Correlated telemetry artifact observed during causal evaluation of service latency incident."
                            />
                          ) : (
                            <DemoValue real={null} demo={demoFiller.copilotInsight} />
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Query Logs Modal with Real Supabase raw_telemetry */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl p-space-xl shadow-xl flex flex-col gap-space-md border border-surface-container max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">data_object</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Raw Telemetry Records
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-code-sm text-on-surface-variant">
              <span>Source Record: <strong className="text-primary">{selectedItem?.source_record_id || '—'}</strong></span>
              <span>{rawLogs.length} raw record{rawLogs.length === 1 ? '' : 's'}</span>
            </div>

            <div className="bg-surface-container-low rounded-lg p-space-md overflow-y-auto max-h-96 font-code-sm text-xs border border-surface-container">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <span className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  <span className="ml-2 text-on-surface-variant">Fetching logs from raw_telemetry...</span>
                </div>
              ) : rawLogs.length > 0 ? (
                <pre className="text-on-surface whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(rawLogs, null, 2)}
                </pre>
              ) : (
                <div className="text-on-surface-variant text-center py-6 italic">
                  No matching rows found in raw_telemetry for source_record_id: {selectedItem?.source_record_id || 'none'}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-surface-container-high/60">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-4 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-headline-sm text-sm border border-surface-container font-medium cursor-pointer"
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
