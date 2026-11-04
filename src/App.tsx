/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { triggerInvestigation } from './services/n8nService';
import { fetchInvestigationOutputById } from './services/investigationService';
import { fetchEvidenceForIncident } from './services/evidenceService';
import { parseHypotheses, buildEvidenceIndex } from './services/hypothesisUtils';

// The 8 Approved Google Stitch Screens
import IncidentSelection from './pages/IncidentSelection';
import InvestigationProgress from './pages/InvestigationProgress';
import InvestigationResults from './pages/InvestigationResults';
import EvidenceDetails from './pages/EvidenceDetails';
import ErrorState from './pages/ErrorState';
import EmptyState from './pages/EmptyState';
import HumanReview from './pages/HumanReview';
import RCAReport from './pages/RCAReport';

export interface InvestigationState {
  status: 'idle' | 'running' | 'success' | 'error';
  outputId: string | null;
  validationStatus: string | null;
  output: any | null;
  error: any | null;
  durationMs?: number | null;
}

export default function App() {
  // Screen state can be: 'selection' | 'progress' | 'results' | 'evidence' | 'error' | 'empty' | 'human-review' | 'rca-report'
  const [currentScreen, setCurrentScreen] = useState('selection');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  // Canonical evidence and selection state
  const [canonicalEvidence, setCanonicalEvidence] = useState<any[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  // Investigation orchestration state
  const [investigationState, setInvestigationState] = useState<InvestigationState>({
    status: 'idle',
    outputId: null,
    validationStatus: null,
    output: null,
    error: null,
    durationMs: null
  });

  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const requestCounterRef = useRef<number>(0);

  // Automatically load canonical evidence whenever selected incident changes
  useEffect(() => {
    if (selectedIncident?.incident_id) {
      fetchEvidenceForIncident(selectedIncident.incident_id).then(({ data, error }) => {
        if (!error && data) {
          setCanonicalEvidence(data);
        }
      });
    }
  }, [selectedIncident?.incident_id]);

  // Compute canonical evidence index Map
  const evidenceIndex = useMemo(() => buildEvidenceIndex(canonicalEvidence), [canonicalEvidence]);

  // Parse hypotheses from investigation output
  const { hypotheses: parsedHypothesesList, error: hypothesesParseError } = useMemo(() => {
    return parseHypotheses(investigationState.output);
  }, [investigationState.output]);

  // Run Investigation handler - invoked exclusively on user button click (never inside automatic useEffect)
  const runInvestigation = async (id?: string | null) => {
    // Ignore second click while already running
    if (investigationState.status === 'running') {
      console.warn('[RootIQ] Investigation is already running. Ignoring duplicate trigger.');
      return;
    }

    const targetIncidentId = id || selectedIncident?.incident_id;
    if (!targetIncidentId) {
      console.error('[RootIQ] Cannot run investigation without an incident.');
      return;
    }

    setActiveIncidentId(targetIncidentId);

    // Cancel any previous in-flight request
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;
    const currentRequestId = ++requestCounterRef.current;
    const startTime = Date.now();

    // Set running state and navigate to progress screen
    setInvestigationState({
      status: 'running',
      outputId: null,
      validationStatus: null,
      output: null,
      error: null,
      durationMs: null
    });
    setCurrentScreen('progress');

    // Step 1: Call n8n webhook
    const { data: n8nData, error: n8nError } = await triggerInvestigation(
      targetIncidentId,
      controller.signal
    );

    // Verify request wasn't superseded or cancelled
    if (requestCounterRef.current !== currentRequestId || controller.signal.aborted) {
      console.log(`[RootIQ] Request #${currentRequestId} superseded or aborted.`);
      return;
    }

    if (n8nError) {
      console.error('[RootIQ] n8n trigger error:', n8nError);
      setInvestigationState({
        status: 'error',
        outputId: null,
        validationStatus: null,
        output: null,
        error: n8nError,
        durationMs: null
      });
      setCurrentScreen('error');
      return;
    }

    const { output_id, validation_status, cachedRow } = n8nData as any;

    // Step 2: Read matching row from Supabase investigation_outputs (or use discovered cachedRow)
    let outputRow = cachedRow;
    if (!outputRow) {
      const { data, error: outputError } = await fetchInvestigationOutputById(output_id);
      if (requestCounterRef.current !== currentRequestId || controller.signal.aborted) {
        return;
      }

      if (outputError) {
        console.error('[RootIQ] Failed to fetch investigation_outputs row:', outputError);
        setInvestigationState({
          status: 'error',
          outputId: output_id,
          validationStatus: validation_status,
          output: null,
          error: outputError,
          durationMs: null
        });
        setCurrentScreen('error');
        return;
      }
      outputRow = data;
    }

    // Step 3: Verify the row's incident_id equals the selected incident
    if (outputRow?.incident_id && outputRow.incident_id !== targetIncidentId) {
      const mismatchError = {
        message: `Investigation output incident mismatch. Expected "${targetIncidentId}", but found "${outputRow.incident_id}".`,
        status: null,
        hint: 'The returned output record in database has a mismatched incident_id.',
        rawBody: JSON.stringify(outputRow, null, 2)
      };
      setInvestigationState({
        status: 'error',
        outputId: output_id,
        validationStatus: validation_status,
        output: outputRow,
        error: mismatchError,
        durationMs: null
      });
      setCurrentScreen('error');
      return;
    }

    // Measure exact elapsed time from trigger to row loaded
    const durationMs = Date.now() - startTime;

    // Step 4: Success! Store row in state
    setInvestigationState({
      status: 'success',
      outputId: output_id,
      validationStatus: validation_status,
      output: outputRow,
      error: null,
      durationMs
    });

    // Ensure evidence is loaded for the incident
    fetchEvidenceForIncident(targetIncidentId).then(({ data, error }) => {
      if (!error && data) {
        setCanonicalEvidence(data);
      }
    });
  };

  // Abort handler
  const handleAbort = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    requestCounterRef.current++;
    setInvestigationState(prev => ({ ...prev, status: 'idle' }));
    setCurrentScreen('selection');
  };

  const handleInvestigationComplete = () => {
    setCurrentScreen('results');
  };

  const handleProceedToHumanReview = () => {
    setCurrentScreen('human-review');
  };

  const handleSubmitHumanReview = () => {
    setCurrentScreen('rca-report');
  };

  const handleViewEvidence = (evidenceId?: string) => {
    if (evidenceId) {
      setSelectedEvidenceId(evidenceId);
    }
    setCurrentScreen('evidence');
  };

  const handleBackToResults = () => {
    setCurrentScreen('results');
  };

  const handleRestartInvestigation = () => {
    setCurrentScreen('selection');
  };

  const handleProceedWithDemo = () => {
    const incId = selectedIncident?.incident_id || activeIncidentId || 'INC-001';
    setInvestigationState({
      status: 'success',
      outputId: 'OUT-DEMO-001',
      validationStatus: 'passed (demo)',
      output: {
        output_id: 'OUT-DEMO-001',
        incident_id: incId,
        validation_status: 'passed (demo)',
        human_review_required: true,
        hypotheses: null
      },
      error: null,
      durationMs: 45000
    });
    setCurrentScreen('results');
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Sidebar (Desktop fixed left 64, Mobile slide-over) */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screen: string) => setCurrentScreen(screen)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container Area */}
      <div className="pl-0 lg:pl-64 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <Header
          onToggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          currentScreen={currentScreen}
          selectedIncident={selectedIncident}
          investigationState={investigationState}
          rank1Hypothesis={parsedHypothesesList[0] || null}
          validationStatus={investigationState.output?.validation_status || investigationState.validationStatus}
        />

        {/* Main Dynamic View Canvas with clean top clearance for the fixed header */}
        <main className="relative w-full min-h-screen bg-background px-4 sm:px-6 lg:px-space-2xl pt-24 pb-12 flex-1">
          {currentScreen === 'selection' && (
            <IncidentSelection
              selectedIncident={selectedIncident}
              isInvestigating={investigationState.status === 'running'}
              onSelectIncident={(inc: any) => {
                setSelectedIncident(inc);
                setActiveIncidentId(inc ? inc.incident_id : null);
              }}
              onRunInvestigation={runInvestigation}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {currentScreen === 'progress' && (
            <InvestigationProgress
              incident={selectedIncident}
              incidentId={selectedIncident ? selectedIncident.incident_id : (activeIncidentId || '—')}
              investigationState={investigationState}
              onComplete={handleInvestigationComplete}
              onAbort={handleAbort}
            />
          )}

          {currentScreen === 'results' && (
            <InvestigationResults
              incident={selectedIncident}
              investigationState={investigationState}
              investigationOutput={investigationState.output}
              hypotheses={parsedHypothesesList}
              hypothesesError={hypothesesParseError}
              evidenceIndex={evidenceIndex}
              canonicalEvidence={canonicalEvidence}
              durationMs={investigationState.durationMs}
              onProceedToHumanReview={handleProceedToHumanReview}
              onViewEvidence={handleViewEvidence}
              onExportReport={() => setCurrentScreen('rca-report')}
            />
          )}

          {currentScreen === 'evidence' && (
            <EvidenceDetails
              incident={selectedIncident}
              investigationOutput={investigationState.output}
              hypotheses={parsedHypothesesList}
              evidenceIndex={evidenceIndex}
              selectedEvidenceId={selectedEvidenceId}
              onSelectEvidenceId={setSelectedEvidenceId}
              onBackToResults={handleBackToResults}
              onSelectIncident={() => setCurrentScreen('selection')}
            />
          )}

          {currentScreen === 'error' && (
            <ErrorState
              error={investigationState.error}
              incidentId={selectedIncident ? selectedIncident.incident_id : (activeIncidentId || '—')}
              service={selectedIncident ? selectedIncident.affected_service : '—'}
              onRetry={() => runInvestigation(activeIncidentId)}
              onProceedWithDemo={handleProceedWithDemo}
              onBackToSelection={() => setCurrentScreen('selection')}
            />
          )}

          {currentScreen === 'empty' && (
            <EmptyState
              onSelectIncident={() => setCurrentScreen('selection')}
              onStartInvestigation={(inc: any) => {
                if (inc) {
                  setSelectedIncident(inc);
                  setActiveIncidentId(inc.incident_id);
                  runInvestigation(inc.incident_id);
                }
              }}
            />
          )}

          {currentScreen === 'human-review' && (
            <HumanReview
              incident={selectedIncident}
              investigationOutput={investigationState.output}
              hypotheses={parsedHypothesesList}
              evidenceIndex={evidenceIndex}
              onBack={handleBackToResults}
              onSubmitDecision={handleSubmitHumanReview}
              onViewAllEvidence={() => handleViewEvidence()}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {currentScreen === 'rca-report' && (
            <RCAReport
              incident={selectedIncident}
              investigationOutput={investigationState.output}
              hypotheses={parsedHypothesesList}
              evidenceIndex={evidenceIndex}
              onRestartInvestigation={handleRestartInvestigation}
              onViewEvidence={handleViewEvidence}
            />
          )}
        </main>
      </div>
    </div>
  );
}
