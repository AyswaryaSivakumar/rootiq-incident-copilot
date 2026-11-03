import React, { useState } from 'react';

export default function ErrorState({ onRetry, onBackToSelection }) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      if (onRetry) onRetry();
    }, 1800);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full py-space-xl">
        <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl p-space-2xl shadow-sm flex flex-col items-center text-center relative overflow-hidden border border-surface-container-high/40">
          {/* Top Decorative Ambient Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-error-container/40 rounded-full blur-2xl pointer-events-none"></div>

          {/* Icon Container */}
          <div className="relative w-20 h-20 rounded-full bg-error-container flex items-center justify-center mb-space-xl shadow-[0_2px_12px_rgba(186,26,26,0.12)]">
            <span
              className="material-symbols-outlined text-error text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
          </div>

          {/* Heading & Explanatory Subtitle */}
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-space-sm tracking-tight">
            Investigation Failed
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-2xl">
            We couldn't complete the investigation due to a timeout.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-space-md mb-space-2xl w-full justify-center flex-wrap">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-80"
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRetrying ? 'animate-spin' : ''}`}>
                replay
              </span>
              <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
            </button>

            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-surface-container-low text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container transition-all duration-150 active:scale-[0.98] cursor-pointer border border-surface-container"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">terminal</span>
              <span>{showDiagnostics ? 'Hide Details' : 'View Details'}</span>
            </button>
          </div>

          {/* Possible Reasons Card */}
          <div className="w-full bg-error-container/60 rounded-xl p-space-lg text-left transition-all border border-error-container">
            <div className="flex items-center gap-space-xs mb-space-sm">
              <span className="material-symbols-outlined text-error text-[16px]">info</span>
              <span className="font-headline-sm text-headline-sm text-error">Possible reasons:</span>
            </div>
            <ul className="flex flex-col gap-space-xs pl-space-lg font-body-md text-body-md text-on-error-container list-disc marker:text-error">
              <li className="pl-space-xs">Temporary API issue</li>
              <li className="pl-space-xs">Large data volume</li>
            </ul>
          </div>

          {/* Collapsible Detailed Diagnostics Panel */}
          {showDiagnostics && (
            <div className="w-full mt-space-md text-left bg-surface-container-low rounded-xl p-space-lg border border-surface-container animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-code-sm text-code-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Incident Diagnostics
                </span>
                <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-error/10 text-error font-code-sm text-code-sm font-semibold">
                  Status: 504 Gateway Timeout
                </span>
              </div>
              <div className="bg-inverse-surface rounded-lg p-space-md text-surface font-code-sm text-code-sm overflow-x-auto leading-relaxed">
                <p className="text-surface-dim">$ rca-engine query --incident INC-001</p>
                <p className="text-error-container mt-1">
                  [FATAL] Query timeout after 60000ms while polling OpenTelemetry traces
                </p>
                <p className="text-surface-variant mt-1">
                  [TRACE] collector.service-mesh.internal → 4,289,102 spans fetched before buffer saturated
                </p>
                <p className="text-surface-dim mt-1">
                  [SYSTEM] Cluster payment-service ingress reported gateway timeout waiting on socket
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Status Footer */}
        <div className="mt-space-lg flex items-center gap-space-lg text-on-surface-variant font-label-md text-label-md flex-wrap justify-center">
          <span className="inline-flex items-center gap-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Target: payment-service
          </span>
          <span className="text-outline-variant">•</span>
          <span className="inline-flex items-center gap-space-xs font-code-sm text-code-sm">
            INC-001
          </span>
          <span className="text-outline-variant">•</span>
          <span className="text-on-surface-variant font-body-sm text-body-sm">Last attempt: Just now</span>
        </div>
      </div>
    </div>
  );
}
