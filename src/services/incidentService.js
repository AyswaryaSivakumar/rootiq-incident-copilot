/**
 * Synthetic incident data model for RootIQ MVP
 * Incident ID: INC-001
 * Service: payment-service
 * Severity: High / P1 Critical
 */

export const SYNTHETIC_INCIDENT = {
  id: "INC-001",
  title: "INC-001 – Payment service latency",
  service: "payment-service",
  severity: "High",
  severityLevel: "P1 Critical",
  environment: "prod-us-east-1",
  status: "Active",
  startedAt: "Oct 28, 2026, 10:15 AM (UTC)",
  startedTimestamp: "2026-10-28T10:15:00Z",
  description: "Payment API p95 latency increased dramatically immediately following canary deployment v1.8.3. Upstream checkout services reporting cascading gateway timeouts.",
  commander: "Ayswarya (On-Call SRE)",
  telemetrySummary: {
    total: 10,
    metrics: 4,
    logs: 3,
    traces: 2,
    deployments: 1,
    dependencies: 1
  },
  readiness: {
    topologyNodes: 14,
    telemetrySynced: "100%",
    llmModel: "Claude-3.5-S / Gemini-2.0-Flash",
    status: "Ready to Execute"
  },
  rawPayload: {
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
  }
};

export const ALL_INCIDENTS = [
  SYNTHETIC_INCIDENT,
  {
    id: "INC-002",
    title: "INC-002 – Auth Gateway 504 Gateway Timeout",
    service: "auth-gateway",
    severity: "High",
    severityLevel: "P2 Major",
    environment: "prod-us-east-1",
    status: "Archived",
    startedAt: "Oct 28, 2026, 08:30 AM (UTC)",
    description: "Token verification endpoint experiencing intermittent 504s during JWKS rotation.",
    telemetrySummary: { total: 6, metrics: 3, logs: 2, traces: 1, deployments: 0, dependencies: 0 }
  },
  {
    id: "INC-003",
    title: "INC-003 – Kafka Partition Rebalance Lag",
    service: "event-streamer",
    severity: "Medium",
    severityLevel: "P3 Moderate",
    environment: "prod-eu-west-1",
    status: "Resolved",
    startedAt: "Oct 27, 2026, 14:10 PM (UTC)",
    description: "Consumer lag spiked to 45,000 offsets during rebalance after worker node restart.",
    telemetrySummary: { total: 8, metrics: 4, logs: 3, traces: 1, deployments: 0, dependencies: 0 }
  }
];

export const getIncidentById = (id = "INC-001") => {
  return ALL_INCIDENTS.find(inc => inc.id === id) || SYNTHETIC_INCIDENT;
};
