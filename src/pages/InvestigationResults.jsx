import React, { useState } from 'react';
import {
  RANKED_HYPOTHESES,
  EVIDENCE_BREAKDOWN,
  NEXT_STEPS
} from '../services/investigationService';

export default function InvestigationResults({
  onProceedToHumanReview,
  onViewEvidence,
  onExportReport
}) {
  const [expandedHypotheses, setExpandedHypotheses] = useState({ 1: false, 2: false, 3: false });

  const toggleExpand = (rank) => {
    setExpandedHypotheses(prev => ({ ...prev, [rank]: !prev[rank] }));
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-space-xl max-w-6xl mx-auto w-full">
        {/* Top Banner matching screen_f859b6fd.png */}
        <div className="flex items-center gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container-high/40">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Investigation Complete!
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Here are the Root Cause Analysis results for INC-001
            </p>
          </div>
        </div>

        {/* 4 Key Metric Summary Cards matching screen_f859b6fd.png */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm sm:gap-space-lg">
          {/* Card 1: Hypotheses */}
          <div className="flex items-center gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container-high/40">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[24px]">lightbulb</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold">3</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                HYPOTHESES
              </span>
            </div>
          </div>

          {/* Card 2: Evidence Items */}
          <div
            onClick={onViewEvidence}
            className="flex items-center gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container-high/40 cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold">10</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                EVIDENCE ITEMS
              </span>
            </div>
          </div>

          {/* Card 3: Investigation Time */}
          <div className="flex items-center gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container-high/40">
            <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold">~ 2 min</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                INVESTIGATION TIME
              </span>
            </div>
          </div>

          {/* Card 4: Data Coverage */}
          <div className="flex items-center gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container-high/40">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold">98%</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                DATA COVERAGE
              </span>
            </div>
          </div>
        </div>

        {/* Main Two-Column Analysis Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column: Top 3 Hypotheses (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="flex items-center justify-between px-space-xs mb-space-xs">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-space-sm">
                <span>Top 3 Root Cause Hypotheses</span>
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              </h2>
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                Bayesian Probability Ranked
              </span>
            </div>

            {/* Hypothesis 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Database connection pool exhaustion
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Insufficient database connections causing request queuing and latency.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">Confidence</span>
                  <span className="font-label-md text-label-md px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    82%
                  </span>
                </div>
              </div>

              {/* Badges strip matching screen_f859b6fd.png */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                    Supporting: E004, E005, E006
                  </span>
                  <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                    Contradictory: E008
                  </span>
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    Uncertainty: Medium
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(1)}
                  className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer border border-surface-container-high/60"
                >
                  <span>{expandedHypotheses[1] ? 'Hide Details' : 'View Details'}</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${expandedHypotheses[1] ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
              </div>

              {expandedHypotheses[1] && (
                <div className="mt-space-xs pt-space-sm border-t border-surface-container-high/60 flex flex-col gap-space-xs bg-surface-container-low/50 p-space-md rounded-lg">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                    Causal Graph Analysis
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                    Following canary deployment v1.8.3, application connection pool configuration was reduced from 50 to 20 connections. Incoming steady-state load of 120 req/s instantly saturated the pool, causing threads to queue in getConnection() for up to 30 seconds before timing out.
                  </p>
                </div>
              )}
            </div>

            {/* Hypothesis 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-headline-sm text-headline-sm flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Downstream service (fraud-check) latency
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Increased latency from fraud-check service causing cascading delays.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">Confidence</span>
                  <span className="font-label-md text-label-md px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    67%
                  </span>
                </div>
              </div>

              {/* Badges strip */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                    Supporting: E002, E005
                  </span>
                  <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                    Contradictory: E008
                  </span>
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-semibold border border-red-200">
                    Uncertainty: High
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(2)}
                  className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer border border-surface-container-high/60"
                >
                  <span>{expandedHypotheses[2] ? 'Hide Details' : 'View Details'}</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${expandedHypotheses[2] ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
              </div>

              {expandedHypotheses[2] && (
                <div className="mt-space-xs pt-space-sm border-t border-surface-container-high/60 flex flex-col gap-space-xs bg-surface-container-low/50 p-space-md rounded-lg">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                    Downstream Check Analysis
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                    Initial alert triage suspected fraud-check API degradation; however, distributed traces (E008) show downstream fraud-check responded within 42ms baseline. While error rates matched, causality is not supported by trace span timings.
                  </p>
                </div>
              )}
            </div>

            {/* Hypothesis 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-headline-sm text-headline-sm flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Increased traffic / load spike
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Unexpected traffic surge causing resource contention.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">Confidence</span>
                  <span className="font-label-md text-label-md px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    54%
                  </span>
                </div>
              </div>

              {/* Badges strip */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                    Supporting: E001, E009
                  </span>
                  <span className="font-code-sm text-code-sm px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                    Contradictory: E010
                  </span>
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-semibold border border-red-200">
                    Uncertainty: High
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(3)}
                  className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer border border-surface-container-high/60"
                >
                  <span>{expandedHypotheses[3] ? 'Hide Details' : 'View Details'}</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${expandedHypotheses[3] ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
              </div>

              {expandedHypotheses[3] && (
                <div className="mt-space-xs pt-space-sm border-t border-surface-container-high/60 flex flex-col gap-space-xs bg-surface-container-low/50 p-space-md rounded-lg">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                    Throughput Analysis
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                    Resource contention was suspected, but ingress metrics (E003) show transaction volume was stable at 120 req/s (±4%). Contradicted by steady-state request metrics.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Evidence Overview & Next Steps (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Evidence Overview Card matching screen_f859b6fd.png */}
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Evidence Overview</h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">10 Total</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div
                  onClick={onViewEvidence}
                  className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[16px]">monitoring</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">Metrics</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">4</span>
                </div>

                <div
                  onClick={onViewEvidence}
                  className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-purple-600">
                      <span className="material-symbols-outlined text-[16px]">description</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">Logs</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">3</span>
                </div>

                <div
                  onClick={onViewEvidence}
                  className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">Traces</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">1</span>
                </div>

                <div
                  onClick={onViewEvidence}
                  className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center text-amber-600">
                      <span className="material-symbols-outlined text-[16px]">publish</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">Deployments</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">1</span>
                </div>

                <div
                  onClick={onViewEvidence}
                  className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-purple-600">
                      <span className="material-symbols-outlined text-[16px]">hub</span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface">Dependencies</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">1</span>
                </div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Next Steps</h3>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">checklist</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-start gap-space-sm p-space-xs">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">Check traffic patterns</span>
                </div>
                <div className="flex items-start gap-space-sm p-space-xs">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">Review autoscaling events</span>
                </div>
                <div className="flex items-start gap-space-sm p-space-xs">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">Validate with load test data</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-space-sm pt-space-md">
                <button
                  type="button"
                  onClick={onExportReport}
                  className="inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors font-headline-sm text-headline-sm border border-surface-container-high/60 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export Report</span>
                </button>
                <button
                  type="button"
                  onClick={onProceedToHumanReview}
                  className="inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-headline-sm text-headline-sm shadow-xs cursor-pointer"
                >
                  <span>Human Review</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
