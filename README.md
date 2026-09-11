# synk — Enterprise Collaborative Engineering Intelligence Platform

Synk is an enterprise-grade collaborative engineering and cybersecurity architecture platform designed for software architects, DevOps engineers, and security teams. It transforms technical documentation from static visual diagrams into an active, version-controlled directed acyclic graph (DAG) powered by Conflict-Free Replicated Data Types (CRDTs), automated STRIDE threat modeling, and Infrastructure as Code (IaC) compilation.

---

## Executive Overview

Modern cloud infrastructure demands continuous alignment between architectural topology, cybersecurity compliance, and deployment automation. Traditional visual whiteboards store static image data without semantic understanding, leading to drift between documentation and actual cloud state.

Synk models every system component as a typed semantic object node within a distributed graph. This architecture enables:
- Visual Git version control with 3-way CRDT graph merging.
- Automated STRIDE threat modeling and 1-click vulnerability remediation.
- Live incident response with automated failover infrastructure provisioning.
- Multi-dimensional architecture health scoring (0-100%) and 1-click AI optimization.
- Instant compilation to Terraform HCL, Kubernetes v1.28 manifests, and Docker Compose configurations.
- Enterprise Role-Based Access Control (RBAC) supporting multi-user collaborative editing across distributed team environments.

---

## Visual Platform Demonstration

### 1. System Architecture Canvas Interface
![System Architecture Canvas Interface](./public/screenshots/canvas_architecture.png)

### 2. Workspace Team & Role-Based Access Control (RBAC)
![Workspace Team & RBAC Permissions](./public/screenshots/rbac_permissions.png)

### 3. Architectural Health Score & AI Auto-Optimization
![Architectural Health Score](./public/screenshots/health_score.png)

### 4. Technical Architecture Specification & Governance Generator
![Technical Spec Generator](./public/screenshots/spec_docs.png)

### 5. Architecture to Code / IaC Compiler
![IaC Code Compiler](./public/screenshots/iac_generator.png)

---

## Comprehensive Feature Guide

### 1. Canvas Git & 3-Way CRDT Merge Engine
- Distributed Version Control: Create lightweight branches (such as `experiment/auth-v2` or `feature/redis-cache`), commit structural updates, and preview delta differences.
- 3-Way Graph Merging: Uses a Conflict-Free Replicated Data Type engine to compare base vs. source vs. target versions. Resolves concurrent node edits and connector path mutations automatically via vector clock ordering.
- Visual Diff Preview: Displays real-time metrics for added nodes, modified properties, and deleted elements prior to completing branch integration.

### 2. STRIDE Cybersecurity Threat Modeling
- Automated Threat Scanner: Evaluates visual topology graphs against the SIX core STRIDE threat categories:
  - Spoofing (Unauthenticated ingress points)
  - Tampering (Unencrypted inter-service transport)
  - Repudiation (Missing immutable audit logs)
  - Information Disclosure (Unencrypted database persistence)
  - Denial of Service (Unprotected API gateways lacking rate limits)
  - Elevation of Privilege (Permissive IAM policies and missing proxy isolation)
- Automated Remediation: Provides 1-click fixes that inject security proxies, upgrade transport encryption to TLS 1.3, or establish private subnet boundaries.

### 3. Incident Response Mode & Failover Provisioning
- Live Anomaly Detection: Triggers a global incident response state when telemetry thresholds indicate operational disruption (such as database connection pool exhaustion).
- AI Root Cause Analysis: Identifies specific bottleneck nodes and presents an executive diagnostic summary.
- 1-Click Infrastructure Remediation: Executes automated failover provisioning by injecting multi-AZ PostgreSQL Read Replicas onto the live canvas graph, restoring system health instantly.

### 4. Architectural Health Score (0-100%)
- Multi-Dimensional Observability: Calculates real-time scores across Security, Reliability, Scalability, and Observability.
- Gap Detection: Identifies missing architectural patterns, such as missing in-memory flash caches (Redis) or edge proxies.
- One-Click AI Auto-Optimizer: Automatically injects missing components to upgrade the system architecture to a 100% grade rating.

### 5. Infrastructure as Code (IaC) & Specification Compiler
- Multi-Provider Compilation:
  - Terraform HCL: Compiles production AWS specs including VPCs, Security Groups, ECS Tasks, RDS PostgreSQL, and ElastiCache.
  - Kubernetes Manifests: Compiles k8s v1.28 Ingress routing, Deployments with HPA rules, StatefulSets, and ClusterIP Services.
  - Docker Compose: Compiles multi-container orchestration manifests with health checks and volume bindings.
- Executive Documentation Export: Generates technical specification reports in Markdown and clean white-background PDF formats for compliance audits.

### 6. DevOps Toolchain & SaaS Integrations
- Toolchain Integration: Connects visually with AWS Cloud, GitHub, Slack, Jira Software, Kubernetes, and Terraform Cloud.
- Encrypted Credential Vault: Interactive configuration dialogs for managing API tokens, AWS Access Keys, Webhook URLs, and Kubeconfig credentials securely.

### 7. Interactive AI Architecture Assistant
- Semantic Prompt Classifier: Generates complete visual architecture topologies from plain text prompts:
  - Healthcare HIPAA Pipeline
  - AWS Cloud Serverless Stack
  - Fintech Payment Gateway
  - Kubernetes Cluster Deployment
  - Microservices E-Commerce Stack
  - Auth Pipeline & OAuth Gateway
- Collision-Free DAG Auto-Layout: Automatically organizes nodes into non-overlapping horizontal layers (Entry Point -> Edge Layer -> Application -> Data Storage) with auto-anchored connector paths.
- Viewport Recentering: Centers zoom and pan coordinates automatically on newly generated diagram components.

---

## Technical Architecture & Technology Stack

### System Architecture Diagram
```
+-----------------------------------------------------------------------+
|                            USER INTERFACE                             |
|    Next.js 16 (App Router)  *  React 19  *  TailwindCSS Glassmorphic   |
+----------------------------------+------------------------------------+
                                   |
                                   v
+----------------------------------+------------------------------------+
|                         GRAPH RENDER ENGINE                           |
|       HTML5 Canvas API Vector Pipeline  *  Auto-Layout DAG Parser     |
+----------------------------------+------------------------------------+
                                   |
                                   v
+----------------------------------+------------------------------------+
|                        DISTRIBUTED STATE STORE                        |
|       Zustand State Manager  *  CRDT 3-Way Vector Clock Log Engine      |
+----------------------------------+------------------------------------+
                                   |
                                   v
+----------------------------------+------------------------------------+
|                         AI & IAC COMPILERS                            |
|  Semantic Prompt Parser  *  Terraform / K8s HCL Compiler * Gemini AI  |
+-----------------------------------------------------------------------+
```

### Technology Specifications
- Core Framework: Next.js 16.3.4 (App Router & Turbopack compilation)
- Frontend Logic: React 19, TypeScript (Strict Mode)
- Styling Engine: Vanilla CSS, TailwindCSS with custom design system tokens
- Canvas Renderer: Custom HTML5 Canvas vector engine with smooth Bezier curve connectors
- State Engine: Zustand with event-sourced CRDT log storage
- AI Engine: Local semantic architecture parser with optional Google Gemini API (`gemini-1.5-flash`) integration

---

## Getting Started

### System Requirements
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/Jithun02/synk.git
cd synk
```

2. Install dependencies:
```bash
npm install
```

3. Configure Environment Variables (Optional):
Create a `.env.local` file in the root directory if you wish to connect an external Google Gemini API key:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
Note: Synk includes a built-in local AI engine that operates out of the box without requiring external API keys.

4. Start the development server:
```bash
npm run dev
```

5. Access the application:
Open your web browser and navigate to `http://localhost:3000`.

---

## Deployment on Vercel

1. Push your repository to GitHub:
```bash
git init
git branch -M main
git add .
git commit -m "synk"
git remote add origin https://github.com/Jithun02/synk.git
git push -u origin main --force
```

2. Log into [Vercel](https://vercel.com/new) and import your `synk` repository.
3. Configure environment variables if using an external AI key (`GEMINI_API_KEY`).
4. Click **Deploy**. Vercel will build and host your production application automatically.

---

## Feature Comparison Matrix

| Feature | Traditional Whiteboards (Miro, Excalidraw) | Synk Enterprise Platform |
| :--- | :--- | :--- |
| Core Data Model | Unstructured vector graphics | Typed semantic directed graph |
| Version Control | Simple linear undo/redo | 3-Way CRDT Git branching & merging |
| Security Intelligence | Manual visual sticky notes | Automated STRIDE threat analysis |
| Code Compilation | Image export only | Terraform HCL, K8s YAML, Docker Compose |
| Incident Response | None | AI root-cause diagnosis & failover auto-provisioning |
| Graph Layout | Manual drag and drop | Bounding-box collision-free DAG auto-layout |
| Team Governance | basic view/edit toggle | Granular RBAC (Owner, Editor, Commenter, Viewer) |

---

## License

Distributed under the MIT License. See `LICENSE` for details.
