import React from 'react';
import { SYNTHETIC_INCIDENT } from '../services/incidentService';

export default function IncidentDetailsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const incident = SYNTHETIC_INCIDENT;
  const raw = incident.rawPayload;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl p-space-xl border border-surface-container flex flex-col gap-space-lg my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">description</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-headline-md text-headline-md text-on-surface">Incident Telemetry Details</h3>
              <span className="font-code-sm text-code-sm text-on-surface-variant">INC-001 • {raw.pagerDutyId}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* PagerDuty Payload Section */}
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Raw PagerDuty Alert Payload
          </span>
          <div className="bg-surface-container-low rounded-xl p-space-md font-code-sm text-code-sm text-on-surface flex flex-col gap-1.5 divide-y divide-surface-container-high/40">
            <div className="flex justify-between py-1">
              <span className="text-secondary">Alert Name:</span>
              <span className="font-semibold text-error">{raw.alertName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Affected Service:</span>
              <span className="font-semibold">{incident.service}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Kubernetes Cluster:</span>
              <span>{raw.cluster}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">Endpoints Triggering Alert:</span>
              <span>{raw.affectedEndpoints.join(', ')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-secondary">p95 Baseline vs Peak:</span>
              <span className="text-error font-bold">{raw.baselineP95} → {raw.peakP95} (+620%)</span>
            </div>
          </div>
        </div>

        {/* Slack Timeline Section */}
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            War-Room Slack Thread ({raw.slackChannel})
          </span>
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm font-body-sm text-body-sm">
            <div className="flex items-start gap-space-sm">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[10px]">
                RB
              </div>
              <div>
                <span className="font-semibold text-on-surface">Release Bot</span>{' '}
                <span className="font-code-sm text-[11px] text-secondary">10:12 AM UTC</span>
                <p className="text-on-surface-variant mt-0.5">
                  Deployment <code>{raw.canaryDeploymentId}</code> finished rolling out 20% canary traffic.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-space-sm">
              <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center text-on-error font-bold text-[10px]">
                PD
              </div>
              <div>
                <span className="font-semibold text-on-surface">PagerDuty Bot</span>{' '}
                <span className="font-code-sm text-[11px] text-secondary">10:16 AM UTC</span>
                <p className="text-error mt-0.5 font-medium">
                  CRITICAL: payment-service p95 latency breached threshold (1800ms &gt; 250ms). Triggering on-call rotation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-space-sm">
              <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-primary font-bold text-[10px]">
                AS
              </div>
              <div>
                <span className="font-semibold text-on-surface">Ayswarya (Incident Commander)</span>{' '}
                <span className="font-code-sm text-[11px] text-secondary">10:18 AM UTC</span>
                <p className="text-on-surface-variant mt-0.5">
                  Acknowledged. Opening RootIQ Copilot session to analyze telemetry and isolate root cause.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-space-xs">
          <button
            onClick={onClose}
            className="px-space-xl py-space-sm rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:bg-primary transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
