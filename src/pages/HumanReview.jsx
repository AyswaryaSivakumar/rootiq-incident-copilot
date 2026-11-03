import React, { useState } from 'react';

export default function HumanReview({
  onBack,
  onSubmitDecision,
  onViewAllEvidence
}) {
  const [selectedDecision, setSelectedDecision] = useState('accept');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitDecision({
        decision: selectedDecision,
        comments,
        submittedAt: new Date().toISOString()
      });
    }, 600);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumbs matching screen_1d54a057.png */}
      <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-xl">
        <div className="flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md">
          <button
            onClick={onBack}
            className="hover:text-primary transition-colors flex items-center gap-space-xs cursor-pointer"
          >
            <span>Investigations</span>
          </button>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold font-code-sm text-code-sm">
            INC-001
          </span>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">Human Review</span>
        </div>

        {/* Live Status Pill matching screen_1d54a057.png */}
        <div className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Stage 4 of 4: Verification</span>
        </div>
      </div>

      {/* Primary Review Banner matching screen_1d54a057.png */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-xs p-space-xl mb-space-xl border border-surface-container-high/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
          <div className="flex flex-col">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Human Review Required
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Review automated investigation findings and confirm the root cause determination.
            </p>
          </div>

          {/* Quick Facts */}
          <div className="flex items-center gap-space-xl shrink-0 self-start md:self-auto">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">CONFIDENCE</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">82% Verified</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">HYPOTHESIS</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">Rank #1 Primary</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Two-Column Diagnostic & Decision Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* LEFT COLUMN: Diagnostic Context & Evidence Stack (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-xl">
          {/* Card: Investigation Summary */}
          <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Investigation Summary</h2>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                RCA Model v3.4
              </span>
            </div>

            <div className="bg-surface-container-low rounded-lg p-space-lg border border-surface-container">
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                Top hypothesis: <span className="font-semibold text-primary">Database connection pool exhaustion</span>, triggered by deployment configuration changes and verified by downstream latency spikes.
              </p>
            </div>

            {/* Telemetry Breakdown Sub-panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">SERVICE TARGET</span>
                <span className="font-headline-sm text-sm text-on-surface font-bold">payment-service</span>
                <span className="font-body-sm text-xs text-error font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span> p95: 1800ms
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">TRIGGER EVENT</span>
                <span className="font-headline-sm text-sm text-on-surface font-bold">v1.8.3 Release</span>
                <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">Pool max reduced (50 → 20)</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">CONTRADICTIONS</span>
                <span className="font-headline-sm text-sm text-on-surface font-bold">E008 Checked</span>
                <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">0 Inconsistencies found</span>
              </div>
            </div>
          </div>

          {/* Card: Key Evidence */}
          <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-md border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Key Evidence</h3>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                5 Signals Linked
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Correlated telemetry artifacts supporting connection pool saturation:
            </p>

            {/* Evidence Badges Strip matching screen_1d54a057.png */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <div
                onClick={onViewAllEvidence}
                className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface font-code-sm text-code-sm cursor-pointer hover:bg-surface-container transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">rocket_launch</span>
                <span className="font-bold">E004</span>
                <span className="text-on-surface-variant text-xs">Deploy</span>
              </div>

              <div
                onClick={onViewAllEvidence}
                className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface font-code-sm text-code-sm cursor-pointer hover:bg-surface-container transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-[16px] text-error">database</span>
                <span className="font-bold">E005</span>
                <span className="text-on-surface-variant text-xs">Timeouts</span>
              </div>

              <div
                onClick={onViewAllEvidence}
                className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface font-code-sm text-code-sm cursor-pointer hover:bg-surface-container transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">speed</span>
                <span className="font-bold">E006</span>
                <span className="text-on-surface-variant text-xs">DB Latency</span>
              </div>

              <div
                onClick={onViewAllEvidence}
                className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface font-code-sm text-code-sm cursor-pointer hover:bg-surface-container transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">hub</span>
                <span className="font-bold">E007</span>
                <span className="text-on-surface-variant text-xs">Conn Queue</span>
              </div>

              <div
                onClick={onViewAllEvidence}
                className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface font-code-sm text-code-sm cursor-pointer hover:bg-surface-container transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-[16px] text-error">trending_up</span>
                <span className="font-bold">E009</span>
                <span className="text-on-surface-variant text-xs">HTTP 504</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-xs text-xs">
              <span className="font-code-sm text-on-surface-variant">
                Correlation coefficient: <strong className="text-on-surface">r = 0.94</strong>
              </span>
              <button
                type="button"
                onClick={onViewAllEvidence}
                className="inline-flex items-center gap-1 font-headline-sm text-primary hover:underline cursor-pointer font-semibold"
              >
                <span>View all evidence</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Auto-Rollback Recommendation Box matching screen_1d54a057.png */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs flex items-center justify-between border border-surface-container-high/40 flex-wrap gap-2">
            <div className="flex items-center gap-space-md">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">sync</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Auto-Rollback Recommendation
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Revert deployment v1.8.3 or scale max connections to 60.
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
              Pending Review
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Decision Engine Panel matching screen_1d54a057.png */}
        <div className="lg:col-span-5 flex flex-col gap-space-xl">
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest rounded-xl p-space-xl shadow-xs flex flex-col gap-space-xl sticky top-24 border border-surface-container-high/40"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">how_to_reg</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Your Decision</h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Required</span>
            </div>

            {/* Decision Radio Action Options */}
            <div className="flex flex-col gap-space-md">
              {/* Option 1: Accept */}
              <label
                onClick={() => setSelectedDecision('accept')}
                className={`relative flex items-start gap-space-md p-space-md rounded-xl transition-all cursor-pointer border ${
                  selectedDecision === 'accept'
                    ? 'bg-blue-50/60 border-primary shadow-xs'
                    : 'bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="rca_decision"
                  value="accept"
                  checked={selectedDecision === 'accept'}
                  onChange={() => setSelectedDecision('accept')}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                    selectedDecision === 'accept'
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-white'
                  }`}
                >
                  {selectedDecision === 'accept' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-headline-sm text-headline-sm ${
                      selectedDecision === 'accept' ? 'text-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    Accept – Confirm root cause
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Approves findings and initiates the automated mitigation sequence.
                  </span>
                </div>
              </label>

              {/* Option 2: Reject */}
              <label
                onClick={() => setSelectedDecision('reject')}
                className={`relative flex items-start gap-space-md p-space-md rounded-xl transition-all cursor-pointer border ${
                  selectedDecision === 'reject'
                    ? 'bg-blue-50/60 border-primary shadow-xs'
                    : 'bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="rca_decision"
                  value="reject"
                  checked={selectedDecision === 'reject'}
                  onChange={() => setSelectedDecision('reject')}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                    selectedDecision === 'reject'
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-white'
                  }`}
                >
                  {selectedDecision === 'reject' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-headline-sm text-headline-sm ${
                      selectedDecision === 'reject' ? 'text-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    Reject – Needs more investigation
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Re-runs autonomous hypothesis generator across downstream trace nodes.
                  </span>
                </div>
              </label>

              {/* Option 3: Request More Evidence */}
              <label
                onClick={() => setSelectedDecision('request_more')}
                className={`relative flex items-start gap-space-md p-space-md rounded-xl transition-all cursor-pointer border ${
                  selectedDecision === 'request_more'
                    ? 'bg-blue-50/60 border-primary shadow-xs'
                    : 'bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="rca_decision"
                  value="request_more"
                  checked={selectedDecision === 'request_more'}
                  onChange={() => setSelectedDecision('request_more')}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                    selectedDecision === 'request_more'
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-white'
                  }`}
                >
                  {selectedDecision === 'request_more' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-headline-sm text-headline-sm ${
                      selectedDecision === 'request_more' ? 'text-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    Request More Evidence
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Ingests deep telemetry logs and container metrics for further analysis.
                  </span>
                </div>
              </label>
            </div>

            {/* Comments Field */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-headline-sm text-headline-sm text-on-surface" htmlFor="review-comments">
                Comments (Optional)
              </label>
              <textarea
                id="review-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder="Add comments or mitigation notes (optional)..."
                className="w-full bg-surface-container-low rounded-lg p-space-md text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none border border-surface-container-high/60"
              />
            </div>

            {/* Action Footer Buttons */}
            <div className="flex items-center justify-between gap-space-md pt-space-xs">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-headline-sm text-headline-sm transition-all cursor-pointer border border-surface-container-high/60"
              >
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-xs transition-all cursor-pointer disabled:opacity-80 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Recording Decision...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    <span>Submit Decision</span>
                  </>
                )}
              </button>
            </div>

            {/* Footnote */}
            <div className="flex items-center gap-space-xs justify-center text-on-surface-variant font-label-sm text-label-sm text-center">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Decision will be recorded in audit log</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
