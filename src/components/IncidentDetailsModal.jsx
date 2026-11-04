import React, { useState, useEffect } from 'react';
import DemoValue from './DemoValue';
import { DEMO_PAGERDUTY_ALERT, DEMO_SLACK_THREAD } from '../demo/demoData';
import { SHOW_DEMO_FILLERS } from '../demo/demoConfig';
import { fetchRawTelemetryForIncident } from '../services/evidenceService';
import { formatUtcDateTime } from '../pages/IncidentSelection';

export default function IncidentDetailsModal({ isOpen, onClose, incident }) {
  const [rawTelemetrySummary, setRawTelemetrySummary] = useState({});
  const [rawTelemetryTotal, setRawTelemetryTotal] = useState(0);

  useEffect(() => {
    if (!isOpen || !incident?.incident_id) return;
    let isMounted = true;
    fetchRawTelemetryForIncident(incident.incident_id).then(({ data, error }) => {
      if (!isMounted) return;
      if (!error && data) {
        setRawTelemetryTotal(data.length);
        const counts = {};
        data.forEach(r => {
          const st = r.source_type || 'Unknown';
          counts[st] = (counts[st] || 0) + 1;
        });
        setRawTelemetrySummary(counts);
      }
    });
    return () => { isMounted = false; };
  }, [isOpen, incident?.incident_id]);

  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl p-space-xl border border-surface-container flex flex-col gap-space-lg my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">description</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Incident Telemetry Details</h3>
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                {incident.incident_id} • <DemoValue real={null} demo={DEMO_PAGERDUTY_ALERT.pagerDutyId} />
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Real Database Incident Properties */}
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Registered Incident Metadata (Supabase)
          </span>
          <div className="bg-surface-container-low rounded-xl p-space-md font-code-sm text-code-sm text-on-surface flex flex-col gap-1.5 divide-y divide-surface-container-high/40">
            <div className="flex justify-between py-1">
              <span className="text-secondary">Incident ID:</span>
              <span className="font-semibold text-primary">{incident.incident_id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Affected Service:</span>
              <span className="font-semibold">{incident.affected_service}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Environment / Severity:</span>
              <span>{incident.environment || '—'} • <strong className="text-error">{incident.severity || '—'}</strong></span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Incident Type:</span>
              <span className="capitalize">{incident.incident_type || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Start Time:</span>
              <span>{formatUtcDateTime(incident.start_time)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">End Time:</span>
              <span>{formatUtcDateTime(incident.end_time)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Baseline Window:</span>
              <span>
                {formatUtcDateTime(incident.baseline_window_start)} → {formatUtcDateTime(incident.baseline_window_end)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Incident Window:</span>
              <span>
                {formatUtcDateTime(incident.incident_window_start)} → {formatUtcDateTime(incident.incident_window_end)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Summary:</span>
              <span className="text-right max-w-xs text-on-surface">{incident.summary || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Operational Governance:</span>
              <span>
                {incident.synthetic_only ? 'Synthetic' : 'Live'} • {incident.human_review_required ? 'Review Req.' : 'No Review'} • {incident.automated_remediation_allowed ? 'Auto-Remediate' : 'Human Remediate'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Raw Telemetry Records:</span>
              <span>
                {rawTelemetryTotal} records {Object.keys(rawTelemetrySummary).length > 0 && `(${Object.entries(rawTelemetrySummary).map(([k, v]) => `${v} ${k}`).join(', ')})`}
              </span>
            </div>
          </div>
        </div>

        {/* PagerDuty Payload Section with Demo Fillers */}
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Alert Context (Demo Fillers)
          </span>
          <div className="bg-surface-container-low rounded-xl p-space-md font-code-sm text-code-sm text-on-surface flex flex-col gap-1.5 divide-y divide-surface-container-high/40">
            <div className="flex justify-between py-1">
              <span className="text-secondary">Alert Name:</span>
              <span className="font-semibold text-error">
                <DemoValue real={null} demo={DEMO_PAGERDUTY_ALERT.alertName} />
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Kubernetes Cluster:</span>
              <span>
                <DemoValue real={null} demo={DEMO_PAGERDUTY_ALERT.cluster} />
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Endpoints Triggering Alert:</span>
              <span>
                <DemoValue real={null} demo={DEMO_PAGERDUTY_ALERT.affectedEndpoints.join(', ')} />
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">p95 Baseline vs Peak:</span>
              <span className="text-error font-bold">
                <DemoValue real={null} demo={`${DEMO_PAGERDUTY_ALERT.baselineP95} → ${DEMO_PAGERDUTY_ALERT.peakP95} (+620%)`} />
              </span>
            </div>
          </div>
        </div>

        {/* Slack Timeline Section */}
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            War-Room Slack Thread (<DemoValue real={null} demo={DEMO_PAGERDUTY_ALERT.slackChannel} />)
          </span>
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm font-body-sm text-body-sm">
            {SHOW_DEMO_FILLERS ? (
              DEMO_SLACK_THREAD.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-space-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${entry.avatarBg}`}>
                    {entry.initials}
                  </div>
                  <div>
                    <span className="font-semibold text-on-surface">
                      <DemoValue real={null} demo={entry.name} />
                    </span>{' '}
                    <span className="font-code-sm text-[11px] text-secondary">
                      <DemoValue real={null} demo={entry.time} />
                    </span>
                    <p className="text-on-surface-variant mt-0.5">
                      <DemoValue real={null} demo={entry.message} />
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-on-surface-variant italic">—</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-space-xs">
          <button
            onClick={onClose}
            className="px-space-xl py-space-sm rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:bg-primary transition-colors cursor-pointer"
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
