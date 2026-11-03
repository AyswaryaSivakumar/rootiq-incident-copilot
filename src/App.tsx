/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// The 8 Approved Google Stitch Screens
import IncidentSelection from './pages/IncidentSelection';
import InvestigationProgress from './pages/InvestigationProgress';
import InvestigationResults from './pages/InvestigationResults';
import EvidenceDetails from './pages/EvidenceDetails';
import ErrorState from './pages/ErrorState';
import EmptyState from './pages/EmptyState';
import HumanReview from './pages/HumanReview';
import RCAReport from './pages/RCAReport';

export default function App() {
  // Screen state can be: 'selection' | 'progress' | 'results' | 'evidence' | 'error' | 'empty' | 'human-review' | 'rca-report'
  const [currentScreen, setCurrentScreen] = useState('selection');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState('INC-001');

  // Navigation handlers
  const handleStartInvestigation = (id = 'INC-001') => {
    setActiveIncidentId(id);
    setCurrentScreen('progress');
  };

  const handleInvestigationComplete = () => {
    setCurrentScreen('results');
  };

  const handleAbort = () => {
    setCurrentScreen('selection');
  };

  const handleProceedToHumanReview = () => {
    setCurrentScreen('human-review');
  };

  const handleSubmitHumanReview = () => {
    setCurrentScreen('rca-report');
  };

  const handleViewEvidence = () => {
    setCurrentScreen('evidence');
  };

  const handleBackToResults = () => {
    setCurrentScreen('results');
  };

  const handleRestartInvestigation = () => {
    setCurrentScreen('selection');
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
          currentIncidentId={activeIncidentId}
        />


        {/* Main Dynamic View Canvas with clean top clearance for the fixed header */}
        <main className="relative w-full min-h-screen bg-background px-4 sm:px-6 lg:px-space-2xl pt-24 pb-12 flex-1">
          {currentScreen === 'selection' && (
            <IncidentSelection
              onRunInvestigation={handleStartInvestigation}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {currentScreen === 'progress' && (
            <InvestigationProgress
              incidentId={activeIncidentId}
              onComplete={handleInvestigationComplete}
              onAbort={handleAbort}
            />
          )}

          {currentScreen === 'results' && (
            <InvestigationResults
              onProceedToHumanReview={handleProceedToHumanReview}
              onViewEvidence={handleViewEvidence}
              onExportReport={() => setCurrentScreen('rca-report')}
            />
          )}

          {currentScreen === 'evidence' && (
            <EvidenceDetails onBackToResults={handleBackToResults} />
          )}

          {currentScreen === 'error' && (
            <ErrorState
              onRetry={() => handleStartInvestigation(activeIncidentId)}
              onBackToSelection={() => setCurrentScreen('selection')}
            />
          )}

          {currentScreen === 'empty' && (
            <EmptyState
              onSelectIncident={() => setCurrentScreen('selection')}
              onStartInvestigation={handleStartInvestigation}
            />
          )}

          {currentScreen === 'human-review' && (
            <HumanReview
              onBack={handleBackToResults}
              onSubmitDecision={handleSubmitHumanReview}
              onViewAllEvidence={handleViewEvidence}
            />
          )}

          {currentScreen === 'rca-report' && (
            <RCAReport
              onRestartInvestigation={handleRestartInvestigation}
              onViewEvidence={handleViewEvidence}
            />
          )}
        </main>
      </div>
    </div>
  );
}
