RootIQ Copilot
An AI-powered root-cause investigation copilot designed for SRE and DevOps teams to analyze payment-service latency incidents, evaluate evidence, and deliver ranked, evidence-backed hypotheses.

🚀 Overview
RootIQ streamlines incident triage by ingesting incident payloads, running structured investigations, and presenting human-reviewed root-cause analysis (RCA) with supporting Evidence IDs, uncertainty metrics, and recommended diagnostic next steps.

🛠️ Tech Stack
Frontend: React, Tailwind CSS (built via Google AI Studio)
Backend / Database: Supabase (PostgreSQL)
Workflow Automation & AI Integration: n8n & Google AI Studio (Gemini API)
Deployment: Vercel

✨ Core Workflow
Incident Intake: Load synthetic payment-service latency incidents.
AI Investigation: Process normalized incident JSON to generate structured, ranked hypotheses.
Evidence Validation: Display supporting and contradictory Evidence IDs alongside uncertainty indicators.
Human Review: Support human oversight with structured review workflows (no autonomous remediation).
