/**
 * Demo Data Repository for RootIQ
 * The ONLY place where dummy demo fallback values reside.
 * Used exclusively via DemoValue when Supabase has no corresponding columns/tables yet.
 */

export const DEMO_PROGRESS_STAGES = [
  { id: 1, name: "Fetching Incident Data", subtext: "12 telemetries ingested" },
  { id: 2, name: "Normalizing Evidence", subtext: "Logs & APM correlated" },
  { id: 3, name: "Running AI Analysis", subtext: "Evaluating 3 hypotheses" },
  { id: 4, name: "Validating Output", subtext: "Consistency check" },
  { id: 5, name: "Preparing Results", subtext: "Compiling RCA dossier" }
];

export const DEMO_HYPOTHESES = [
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
    detailedExplanation: "Initial alert triage suspected fraud-check API degradation; however, distributed traces show downstream fraud-check responded within 42ms baseline. While error rates matched, causality is not supported by trace span timings.",
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
    detailedExplanation: "Resource contention was suspected, but ingress metrics show transaction volume was stable at 120 req/s (±4%). Contradicted by steady-state request metrics.",
    telemetryCorrelation: "Negative (r = -0.12)"
  }
];

export const DEMO_NEXT_STEPS = [
  "Check traffic patterns",
  "Review autoscaling events",
  "Validate with load test data"
];

export const DEMO_ALERTS = [
  {
    id: "alert-1",
    title: "p95 Latency Threshold Breach",
    description: "1800ms observed on /v2/charge (620% over SLA)",
    timestamp: "3 mins ago",
    type: "warning"
  },
  {
    id: "alert-2",
    title: "AI Hypothesis Model Ready",
    description: "Connection pool exhaustion ranked #1 (82% confidence)",
    timestamp: "Just now",
    type: "info"
  }
];

export const DEMO_PAGERDUTY_ALERT = {
  pagerDutyId: "PD-984210",
  alertName: "PaymentService_p95_LatencyBreach_Critical",
  cluster: "k8s-prod-us-east-1-app-cluster",
  namespace: "payments",
  affectedEndpoints: ["POST /v2/charge", "POST /v2/authorize"],
  baselineP95: "240 ms",
  peakP95: "1,800 ms",
  errorRate: "8.5%",
  slackChannel: "#incident-inc-001-payments",
  canaryDeploymentId: "deploy-payment-v1.8.3-9c0f4d1"
};

export const DEMO_SLACK_THREAD = [
  {
    initials: "RB",
    name: "Release Bot",
    time: "10:12 AM UTC",
    message: "Deployment deploy-payment-v1.8.3-9c0f4d1 finished rolling out 20% canary traffic.",
    avatarBg: "bg-primary text-on-primary"
  },
  {
    initials: "PD",
    name: "PagerDuty Bot",
    time: "10:16 AM UTC",
    message: "CRITICAL: payment-service p95 latency breached threshold (1800ms > 250ms). Triggering on-call rotation.",
    avatarBg: "bg-error text-on-error"
  },
  {
    initials: "AS",
    name: "Ayswarya (Incident Commander)",
    time: "10:18 AM UTC",
    message: "Acknowledged. Opening RootIQ Copilot session to analyze telemetry and isolate root cause.",
    avatarBg: "bg-secondary-fixed text-primary"
  }
];

export const DEMO_CHART_POINTS = [
  { time: "10:00", value: 240 },
  { time: "10:05", value: 250 },
  { time: "10:10", value: 270 },
  { time: "10:12", value: 310, isDeploy: true },
  { time: "10:15", value: 780 },
  { time: "10:18", value: 1420 },
  { time: "10:20", value: 1800, isPeak: true },
  { time: "10:25", value: 1650 },
  { time: "10:30", value: 1350 }
];

export const DEMO_EVIDENCE_FILLERS = [
  {
    shortTitle: "Payment API p95 Latency",
    peakValue: "1800 ms",
    badgeValue: "↑620%",
    matchedRank: "Rank #1 Match",
    associatedHypothesis: "Supports Hypothesis 1: Database connection pool exhaustion. Degradation began 4 minutes following rollout.",
    copilotInsight: "Latency elevated abruptly from 240ms to 1800ms within 90 seconds. Thread contention profile correlates 99.4% with simultaneous deployment of commit #9c0f4d1."
  },
  {
    shortTitle: "Payment Error Rate",
    peakValue: "8.5%",
    badgeValue: "↑17x",
    matchedRank: "Rank #2 Match",
    associatedHypothesis: "Supports Hypothesis 2: Downstream service latency and Hypothesis 1: DB pool exhaustion.",
    copilotInsight: "504 Gateway Timeouts began surging at 10:16 AM, exactly when client connection wait queues surpassed 5,000ms timeout threshold."
  },
  {
    shortTitle: "Request Rate",
    peakValue: "120 req/s",
    badgeValue: "Steady",
    matchedRank: "Contradiction",
    associatedHypothesis: "Contradicts Hypothesis 3: Traffic surge. Incoming throughput remained flat at ~120 req/s.",
    copilotInsight: "Traffic volume remained nominal with no abnormal DDoS, flash sale, or bot amplification detected in WAF edge logs."
  },
  {
    shortTitle: "Deployment Config",
    peakValue: "v1.8.3",
    badgeValue: "Release",
    matchedRank: "Root Trigger",
    associatedHypothesis: "Key causal trigger. Deployment lowered HikariCP maximumPoolSize from 50 to 20 in application.yml.",
    copilotInsight: "Commit #9c0f4d1 altered database pool parameters inadvertently in staging config sync, triggering connection starvation under normal load."
  },
  {
    shortTitle: "Database Query Latency",
    peakValue: "950 ms",
    badgeValue: "Elevated",
    matchedRank: "Rank #1 Match",
    associatedHypothesis: "Supports Hypothesis 1: Connection pool bottleneck leading to replica lock queues.",
    copilotInsight: "PostgreSQL wait event pg_stat_activity indicates active queries blocked awaiting transaction locks from queued workers."
  }
];

export const DEMO_RCA_REPORT = {
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
      title: "Audit DB pool size",
      subtext: "Review configuration thresholds in Helm chart values for production",
      priority: "P0"
    },
    {
      title: "Inspect latency metrics",
      subtext: "Validate Prometheus alert rules for query wait times > 250ms",
      priority: "P1"
    },
    {
      title: "Analyze load test data",
      subtext: "Check 120 req/s concurrency baseline before next deploy",
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

export const DEMO_REVIEW_PROPOSAL = {
  recommendationTitle: "Diagnostic Finding",
  recommendationDetails: "Inspect deployment v1.8.3 configuration diff and verify connection pool settings.",
  acceptDetails: "Confirms the root cause. No automated remediation is performed."
};

export const DEMO_REVIEW_METRICS = {
  confidence: "82% Verified",
  p95Breach: "p95: 1,800 ms"
};

export const DEMO_ERROR_LOGS = [
  "[FATAL] Query timeout after 60000ms while polling OpenTelemetry traces",
  "[TRACE] collector.service-mesh.internal → 4,289,102 spans fetched before buffer saturated",
  "[SYSTEM] Cluster payment-service ingress reported gateway timeout waiting on socket"
];

export const DEMO_TIMELINE_ENTRIES = [
  {
    time: "10:12 AM UTC",
    title: "Deployment canary rolled out",
    subtext: "Configuration commit adjusted HikariCP pool capacity to 20.",
    color: "primary"
  },
  {
    time: "10:15 AM UTC",
    title: "Latency surged past threshold",
    subtext: "Database client socket queue depth reached 142 waiting connections.",
    color: "error"
  },
  {
    time: "10:28 AM UTC",
    title: "RootIQ Causal Engine identified root cause",
    subtext: "Approved by Incident Commander Ayswarya with 82% confidence score.",
    color: "emerald-600"
  }
];

export const DEMO_INVESTIGATION_SUMMARY = {
  duration: "~ 2 min",
  coverage: "98%"
};
