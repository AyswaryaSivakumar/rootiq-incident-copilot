import React, { useState, useEffect } from 'react';
import { PROGRESS_STAGES } from '../services/investigationService';

export default function InvestigationProgress({
  onComplete,
  onAbort,
  incidentId = "INC-001"
}) {
  const [seconds, setSeconds] = useState(789); // ~ 13:09 like in screen_9d0b6e79.png
  const [activeStageIndex, setActiveStageIndex] = useState(2); // Running AI Analysis

  // Real-time elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-space-2xl">
        {/* Main Investigation Card matching screen_9d0b6e79.png */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-2xl shadow-sm flex flex-col gap-space-2xl border border-surface-container-high/40">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-surface-container-high/40 blur-3xl pointer-events-none"></div>

          {/* Title and Subtitle */}
          <div className="flex flex-col gap-space-xs z-10">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Investigating Incident: <span className="text-primary-container">{incidentId}</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Analyzing evidence, generating hypotheses and validating results...
            </p>
          </div>

          {/* 5-Stage Stepper */}
          <div className="relative w-full py-space-xl px-space-md z-10 overflow-x-auto">
            <div className="flex items-start justify-between relative min-w-[680px]">
              {PROGRESS_STAGES.map((stage, idx) => {
                const isCompleted = idx < activeStageIndex;
                const isCurrent = idx === activeStageIndex;
                const isPending = idx > activeStageIndex;

                return (
                  <React.Fragment key={stage.id}>
                    {/* Stage Item */}
                    <div className={`flex flex-col items-center flex-1 group ${isPending ? 'opacity-60' : ''}`}>
                      {isCompleted ? (
                        <div
                          className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center text-on-secondary mb-space-sm ring-4 ring-surface-container transition-transform group-hover:scale-105"
                          style={{ backgroundColor: '#10b981' }}
                        >
                          <span className="material-symbols-outlined text-[24px]">check</span>
                        </div>
                      ) : isCurrent ? (
                        <div className="relative flex items-center justify-center mb-space-sm">
                          <span className="absolute w-14 h-14 rounded-full bg-primary-container/20 animate-ping"></span>
                          <div className="relative w-12 h-12 rounded-full bg-primary-container text-on-primary shadow-md flex items-center justify-center ring-4 ring-primary-fixed">
                            <span
                              className="material-symbols-outlined text-[24px] animate-spin"
                              style={{ animationDuration: '4s' }}
                            >
                              auto_awesome
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-surface-container-low text-outline flex items-center justify-center mb-space-sm shadow-inner">
                          <span className="w-3.5 h-3.5 rounded-full bg-outline-variant"></span>
                        </div>
                      )}

                      <span
                        className={`font-headline-sm text-headline-sm text-center ${
                          isCurrent
                            ? 'text-primary-container font-bold'
                            : isCompleted
                            ? 'text-on-surface font-semibold'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {stage.name}
                      </span>
                      <span
                        className={`font-code-sm text-code-sm mt-1 text-center ${
                          isCurrent
                            ? 'text-primary font-medium'
                            : 'text-on-surface-variant/70'
                        }`}
                      >
                        {stage.subtext}
                      </span>
                    </div>

                    {/* Chevron Divider */}
                    {idx < PROGRESS_STAGES.length - 1 && (
                      <div
                        className={`flex items-center justify-center pt-4 px-2 ${
                          idx < activeStageIndex
                            ? 'text-on-surface-variant/40'
                            : idx === activeStageIndex
                            ? 'text-primary-container'
                            : 'text-outline-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Time & Diagnostic Card Banner matching screen_9d0b6e79.png */}
          <div className="relative mt-space-lg p-space-2xl rounded-xl bg-surface-container-low/70 flex flex-col md:flex-row items-center justify-between gap-space-2xl overflow-hidden border border-surface-container">
            <div className="flex items-center gap-space-xl z-10 max-w-xl">
              {/* Circular Ring with Psychology Icon */}
              <div className="relative shrink-0 w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 64 64">
                  <circle
                    className="text-surface-container-highest"
                    cx="32"
                    cy="32"
                    fill="transparent"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <circle
                    className="text-primary-container animate-pulse"
                    cx="32"
                    cy="32"
                    fill="transparent"
                    r="28"
                    stroke="currentColor"
                    strokeDasharray="175"
                    strokeDashoffset="65"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px] text-primary-container">
                    psychology
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-xs">
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    This may take 30–60 seconds...
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  You can leave this page. We'll notify you when the results are ready.
                </p>
                <div className="flex items-center gap-space-md mt-space-xs text-on-surface-variant font-code-sm text-code-sm flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                    Elapsed: <span className="font-bold text-on-surface">{mins}:{secs}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">memory</span>
                    Active Agent: Causal-Reasoner-v4
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Illustration */}
            <div className="relative shrink-0 flex items-center justify-center w-64 h-36 select-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-high/40 to-transparent rounded-lg"></div>
              <svg className="w-56 h-32" fill="none" viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg">
                <rect className="drop-shadow-sm" fill="white" height="90" rx="6" width="130" x="25" y="15" />
                <line stroke="#CBD5E1" strokeLinecap="round" strokeWidth="4" x1="40" x2="110" y1="32" y2="32" />
                <line stroke="#E2E8F0" strokeLinecap="round" strokeWidth="3" x1="40" x2="135" y1="46" y2="46" />
                <line stroke="#E2E8F0" strokeLinecap="round" strokeWidth="3" x1="40" x2="120" y1="58" y2="58" />
                <line stroke="#E2E8F0" strokeLinecap="round" strokeWidth="3" x1="40" x2="95" y1="70" y2="70" />
                <line stroke="#E2E8F0" strokeLinecap="round" strokeWidth="3" x1="40" x2="130" y1="82" y2="82" />
                <circle cx="140" cy="65" fill="#EFF6FF" fillOpacity="0.85" r="32" />
                <circle cx="140" cy="65" fill="none" r="30" stroke="#2563EB" strokeWidth="3.5" />
                <line stroke="#2563EB" strokeLinecap="round" strokeWidth="6" x1="162" x2="188" y1="87" y2="112" />
                <circle cx="140" cy="65" fill="#BFDBFE" fillOpacity="0.4" r="16" />
                <path d="M130 68 L137 60 L143 65 L150 56" stroke="#2563EB" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <circle cx="150" cy="56" fill="#2563EB" r="2.5" />
                <circle className="animate-ping" cx="50" cy="18" fill="#3B82F6" r="3" style={{ animationDuration: '2.5s' }} />
              </svg>
            </div>
          </div>

          {/* Convenient Advance Action Button */}
          <div className="flex justify-between items-center pt-space-xs">
            <button
              onClick={onAbort}
              className="text-on-surface-variant hover:text-error text-xs font-medium cursor-pointer inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              <span>Cancel Run</span>
            </button>
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-space-xs px-space-lg py-2 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-primary-container transition-all shadow-sm cursor-pointer"
            >
              <span>View Results Now</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
