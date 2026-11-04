import React, { useState } from 'react';
import DemoValue from '../components/DemoValue';
import { DEMO_ERROR_LOGS } from '../demo/demoData';

export default function ErrorState({
  error = null,
  incidentId = '—',
  service = '—',
  onRetry,
  onProceedWithDemo,
  onBackToSelection
}) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      if (onRetry) onRetry();
    }, 600);
  };

  const hasRealError = Boolean(error);
  const errorMessage = error?.message || (typeof error === 'string' ? error : null);
  const errorHint = error?.hint || null;
  const errorStatus = error?.status || error?.code || null;
  const rawBody = error?.rawBody || null;

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
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-space-sm tracking-tight font-semibold">
            Investigation Failed
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-2xl">
            {hasRealError ? (
              <span className="text-error font-medium">{errorMessage}</span>
            ) : (
              <DemoValue real={null} demo="We couldn't complete the investigation due to a timeout." />
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-space-md mb-space-2xl w-full justify-center flex-wrap">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-80 font-semibold"
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRetrying ? 'animate-spin' : ''}`}>
                replay
              </span>
              <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
            </button>

            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-surface-container-low text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container transition-all duration-150 active:scale-[0.98] cursor-pointer border border-surface-container font-medium"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">terminal</span>
              <span>{showDiagnostics ? 'Hide Details' : 'View Details'}</span>
            </button>

            {onProceedWithDemo && (
              <button
                onClick={onProceedWithDemo}
                className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-surface-container-lowest text-primary font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all duration-150 active:scale-[0.98] cursor-pointer border border-primary/30 font-semibold"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>Preview with Demo Results</span>
              </button>
            )}
          </div>

          {/* Possible Reasons / Diagnostic Hint Card */}
          <div className="w-full bg-error-container/60 rounded-xl p-space-lg text-left transition-all border border-error-container">
            <div className="flex items-center gap-space-xs mb-space-sm">
              <span className="material-symbols-outlined text-error text-[16px]">info</span>
              <span className="font-headline-sm text-headline-sm text-error font-semibold">
                {errorHint ? 'Recommended Action:' : 'Possible reasons:'}
              </span>
            </div>
            {errorHint ? (
              <p className="font-body-md text-body-md text-on-error-container font-medium leading-relaxed">
                {errorHint}
              </p>
            ) : (
              <ul className="flex flex-col gap-space-xs pl-space-lg font-body-md text-body-md text-on-error-container list-disc marker:text-error">
                <li className="pl-space-xs">Database network connectivity or authentication timeout</li>
                <li className="pl-space-xs">Supabase Row-Level Security (RLS) restrictions</li>
                <li className="pl-space-xs">Temporary API latency breach</li>
              </ul>
            )}
          </div>

          {/* Collapsible Detailed Diagnostics Panel */}
          {showDiagnostics && (
            <div className="w-full mt-space-md text-left bg-surface-container-low rounded-xl p-space-lg border border-surface-container animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-code-sm text-code-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Incident Diagnostics
                </span>
                <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-error/10 text-error font-code-sm text-code-sm font-semibold">
                  Status: {errorStatus || 'Execution Failed'}
                </span>
              </div>
              <div className="bg-inverse-surface rounded-lg p-space-md text-surface font-code-sm text-code-sm overflow-x-auto leading-relaxed">
                <p className="text-surface-dim">$ rca-engine query --incident {incidentId}</p>
                {hasRealError ? (
                  <>
                    <p className="text-error-container mt-1">[ERROR] {errorMessage}</p>
                    {errorStatus && <p className="text-surface-variant mt-1">[HTTP STATUS] {errorStatus}</p>}
                    {errorHint && <p className="text-surface-dim mt-1">[HINT] {errorHint}</p>}
                    {rawBody && (
                      <div className="mt-2 pt-2 border-t border-surface-variant/30">
                        <span className="text-secondary text-[11px] block mb-1">[RAW RESPONSE]:</span>
                        <pre className="text-xs text-surface whitespace-pre-wrap">{rawBody}</pre>
                      </div>
                    )}
                  </>
                ) : (
                  DEMO_ERROR_LOGS.map((logLine, idx) => (
                    <p key={idx} className={`mt-1 ${idx === 0 ? 'text-error-container' : idx === 1 ? 'text-surface-variant' : 'text-surface-dim'}`}>
                      <DemoValue real={null} demo={logLine} />
                    </p>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Status Footer */}
        <div className="mt-space-lg flex items-center gap-space-lg text-on-surface-variant font-label-md text-label-md flex-wrap justify-center">
          <span className="inline-flex items-center gap-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Target: <strong className="text-on-surface">{service}</strong>
          </span>
          <span className="text-outline-variant">•</span>
          <span className="inline-flex items-center gap-space-xs font-code-sm text-code-sm font-bold text-on-surface">
            {incidentId}
          </span>
          <span className="text-outline-variant">•</span>
          <span className="text-on-surface-variant font-body-sm text-body-sm">
            <button
              onClick={onBackToSelection}
              className="text-primary hover:underline cursor-pointer font-medium"
              type="button"
            >
              Back to Incident Selection
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
