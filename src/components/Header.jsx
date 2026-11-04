import React, { useState } from 'react';
import { DEMO_ALERTS } from '../demo/demoData';
import { SHOW_DEMO_FILLERS } from '../demo/demoConfig';
import DemoValue from './DemoValue';

export default function Header({
  onToggleMobile,
  currentScreen = 'selection',
  selectedIncident,
  investigationState,
  rank1Hypothesis,
  validationStatus
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const incidentId = selectedIncident?.incident_id || 'NO INCIDENT';
  const incidentTitle = selectedIncident?.title || 'RootIQ Copilot';

  // Dynamic left context in header matching each screen
  const renderHeaderLeft = () => {
    if (currentScreen === 'results' || currentScreen === 'progress') {
      return (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-code-sm text-xs font-semibold">
            INCIDENT #{incidentId}
          </span>
          <span className="text-on-surface-variant font-body-sm text-xs hidden sm:inline truncate max-w-xs">
            {incidentTitle}
          </span>
        </div>
      );
    }

    if (currentScreen === 'human-review') {
      return (
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span className="font-semibold text-on-surface">Incident Command</span>
          <span className="text-outline-variant">•</span>
          <span>{incidentId}</span>
        </div>
      );
    }

    if (currentScreen === 'rca-report') {
      return (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-code-sm text-xs font-semibold">
            {incidentId}
          </span>
          <span className="text-on-surface-variant font-body-sm text-xs hidden sm:inline">
            Investigation Complete
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-4 sm:px-6 lg:px-space-2xl">
      <div className="flex items-center gap-space-md">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {renderHeaderLeft()}
      </div>

      <div className="flex items-center gap-space-md sm:gap-space-xl relative">
        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {SHOW_DEMO_FILLERS && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-container-lowest"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl p-space-md z-50 border border-surface-container flex flex-col gap-space-sm animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high/60">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Recent Alerts</span>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold">
                  {SHOW_DEMO_FILLERS ? `${DEMO_ALERTS.length} New` : '0 New'}
                </span>
              </div>
              <div className="flex flex-col gap-space-xs text-left">
                {investigationState?.output ? (
                  <>
                    <div className="p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
                      <div className="flex items-center gap-1.5 font-headline-sm text-[12px] text-primary">
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        <span className="font-semibold">Investigation complete</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface mt-0.5 font-medium line-clamp-2">
                        {rank1Hypothesis?.hypothesis || 'Root cause analysis complete'}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="font-code-sm text-primary font-semibold">
                          Validation: {validationStatus || 'passed'}
                        </span>
                        <span className="text-secondary font-code-sm">Just now</span>
                      </div>
                    </div>
                    {/* Secondary system notification */}
                    <div className="p-space-xs rounded-lg bg-surface-container-low/70 hover:bg-surface-container transition-colors cursor-pointer opacity-80">
                      <div className="flex items-center gap-1.5 font-headline-sm text-[12px] text-error">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        <span>
                          <DemoValue real={null} demo="Latency Threshold Breach" />
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        <DemoValue real={null} demo="payment-service p95 latency exceeded 250ms threshold" />
                      </p>
                      <span className="font-code-sm text-[10px] text-secondary">
                        <DemoValue real={null} demo="10:15 AM UTC" />
                      </span>
                    </div>
                  </>
                ) : SHOW_DEMO_FILLERS ? (
                  DEMO_ALERTS.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 font-headline-sm text-[12px] text-error">
                        <span className="material-symbols-outlined text-[14px]">
                          {alert.type === 'warning' ? 'warning' : 'psychology'}
                        </span>
                        <span>
                          <DemoValue real={null} demo={alert.title} />
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        <DemoValue real={null} demo={alert.description} />
                      </p>
                      <span className="font-code-sm text-[10px] text-secondary">
                        <DemoValue real={null} demo={alert.timestamp} />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-space-sm text-on-surface-variant text-xs text-center italic">
                    No new alerts
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile matching AY avatar in screenshot */}
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-xs tracking-wider">
              AY
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface hidden md:inline font-semibold">
                Ayswarya
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                keyboard_arrow_down
              </span>
            </div>
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl p-space-md z-50 border border-surface-container flex flex-col gap-space-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="pb-space-xs border-b border-surface-container-high/60">
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">Ayswarya</p>
                <p className="font-code-sm text-[11px] text-on-surface-variant">On-Call Lead SRE</p>
              </div>
              <div className="pt-space-xs flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-2 p-1.5 rounded hover:bg-surface-container cursor-pointer text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
                  Role: Incident Commander
                </span>
                <span className="flex items-center gap-2 p-1.5 rounded hover:bg-surface-container cursor-pointer text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
                  Copilot Tuning: Precision
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
