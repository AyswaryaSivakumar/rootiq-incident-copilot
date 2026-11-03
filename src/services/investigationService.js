/**
 * Investigation Service for RootIQ
 * Manages hypotheses, investigation stages, and RCA synthesis.
 */

export const PROGRESS_STAGES = [
  { id: 1, name: "Fetching Incident Data", subtext: "12 telemetries ingested", durationMs: 2000 },
  { id: 2, name: "Normalizing Evidence", subtext: "Logs & APM correlated", durationMs: 2500 },
  { id: 3, name: "Running AI Analysis", subtext: "Evaluating 3 hypotheses", durationMs: 3000 },
  { id: 4, name: "Validating Output", subtext: "Consistency check", durationMs: 2000 },
  { id: 5, name: "Preparing Results", subtext: "Compiling RCA dossier", durationMs: 1500 }
];

export const RANKED_HYPOTHESES = [
  {
    rank: 1,
    title: "Database connection pool exhaustion",
    description: "Insufficient database connections causing request queuing and latency.",
    confidence: "82%",
    confidenceScore: 0.82,
    uncertainty: "Medium",
    uncertaintyColor: "text-on-secondary-fixed-variant",
    supporting: ["E004", "E005", "E006", "E007", "E010"],
    contradictory: ["E008"],
    detailedExplanation: "Following canary deployment v1.8.3, application connection pool configuration was reduced from 50 to 20 connections. Incoming steady-state load of 120 req/s instantly saturated the pool, causing threads to queue in getConnection() for up to 30 seconds before timing out.",
    telemetryCorrelation: "Strong (r = 0.94)"
  },
  {
    rank: 2,
    title: "Downstream service (fraud-check) latency",
    description: "Increased latency from fraud-check service causing cascading delays.",
    confidence: "67%",
    confidenceScore: 0.67,
    uncertainty: "High",
    uncertaintyColor: "text-error",
    supporting: ["E002", "E005"],
    contradictory: ["E008"],
    detailedExplanation: "Initial alert triage suspected fraud-check API degradation; however, distributed traces (E008) show downstream fraud-check responded within 42ms baseline. While error rates matched, causality is not supported by trace span timings.",
    telemetryCorrelation: "Weak (r = 0.31)"
  },
  {
    rank: 3,
    title: "Increased traffic / load spike",
    description: "Unexpected traffic surge causing resource contention.",
    confidence: "54%",
    confidenceScore: 0.54,
    uncertainty: "High",
    uncertaintyColor: "text-error",
    supporting: ["E001", "E009"],
    contradictory: ["E003", "E010"],
    detailedExplanation: "Resource contention was suspected, but ingress metrics (E003) show transaction volume was stable at 120 req/s (±4%). Contradicted by steady-state request metrics.",
    telemetryCorrelation: "Negative (r = -0.12)"
  }
];

export const EVIDENCE_BREAKDOWN = [
  { category: "Metrics", count: 4, icon: "monitoring", color: "text-primary", bg: "bg-primary-fixed" },
  { category: "Logs", count: 3, icon: "description", color: "text-tertiary", bg: "bg-tertiary-fixed" },
  { category: "Traces", count: 1, icon: "account_tree", color: "text-primary-container", bg: "bg-secondary-container" },
  { category: "Deployments", count: 1, icon: "publish", color: "text-secondary", bg: "bg-surface-container-highest" },
  { category: "Dependencies", count: 1, icon: "hub", color: "text-tertiary", bg: "bg-tertiary-fixed-dim/40" }
];

export const NEXT_STEPS = [
  "Check traffic patterns",
  "Review autoscaling events",
  "Validate with load test data"
];

export const RCA_REPORT_DATA = {
  incidentId: "INC-001",
  title: "RCA Report Ready",
  subtitle: "Investigation completed and saved successfully.",
  mttd: "4m",
  mttr: "22m",
  confidence: "High Confidence",
  confidenceScore: "94%",
  primaryRootCause: "Database connection pool capacity was reduced during deployment, contributing to database timeouts.",
  keyFindings: [
    {
      title: "Deployment change detected (v1.8.3)",
      subtext: "Triggered at 10:12 AM UTC via GitLab CI Pipeline #48102"
    },
    {
      title: "Database latency increased (950 ms)",
      subtext: "Elevated from baseline 38ms; caused queue saturation"
    },
    {
      title: "Connection pool reduced (50 → 20)",
      subtext: "Configuration commit #c8f90a applied accidentally"
    }
  ],
  recommendedActions: [
    {
      title: "Review DB pool size",
      subtext: "Set minimum thresholds in Helm chart values for production",
      priority: "P0"
    },
    {
      title: "Monitor latency",
      subtext: "Configure Prometheus alert for query wait times > 250ms",
      priority: "P1"
    },
    {
      title: "Run load test",
      subtext: "Simulate 120 req/s concurrency peak before next deploy",
      priority: "P2"
    }
  ],
  sparklineStats: [
    {
      label: "API p95 Latency",
      badge: "+620%",
      badgeType: "error",
      value: "1,800 ms",
      subtext: "vs 250ms SLA",
      chartColor: "text-error",
      svgPoints: "M0 20 L20 19 L40 18 L60 21 L75 3 L90 12 L100 6"
    },
    {
      label: "DB Query Timeouts",
      badge: "42 errs",
      badgeType: "error",
      value: "8.5%",
      subtext: "overall error rate",
      chartColor: "text-primary",
      svgPoints: "M0 22 L25 21 L50 20 L65 4 L80 8 L100 19"
    },
    {
      label: "DB Pool Saturation",
      badge: "100% cap",
      badgeType: "neutral",
      value: "20 / 20",
      subtext: "conns locked",
      chartColor: "text-tertiary",
      svgPoints: "M0 20 L30 18 L55 5 L75 5 L85 5 L100 18"
    }
  ],
  auditedBy: "Ayswarya (On-Call SRE)",
  environment: "Production (US-East-1)",
  resolvedAt: "Oct 28, 2026 10:37 AM UTC"
};
