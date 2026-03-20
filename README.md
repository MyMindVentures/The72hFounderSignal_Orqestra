## 1. Hero Section

Parallax Studio builds real systems for builders. This repo is the technical foundation behind **The 72H Founder Signal**: a blueprint-to-workflow platform where ideas become observable execution, and execution becomes something we can verify.

![The 72H Founder Signal poster by Parallax Studio](./The%2072h%20Founder%20Signal.png)

**Generation prompt (Hero Theme — futuristic software architecture, cosmic geometric design):**  
“Futuristic software architecture poster, cosmic geometric design, Parallax Studio logo badge, headline text ‘The 72H Founder Signal’, subtitle ‘Show how you think. Build what matters.’, subtle blueprint/workflow dashboard elements, electric blue and violet glow, high-contrast cinematic lighting, developer-oriented design, no clutter, ultra-detailed, 16:9”

---

## 2. About Parallax Studio

Parallax Studio is an innovation studio guided by: **“Different perspectives. Real products.”**

We don’t chase vibes. We chase systems that translate thinking into buildable artifacts—then we make those artifacts inspectable, debuggable, and test-hardened.

**Image placeholder (AI-generated):**
Alt text: Parallax Studio innovation lab with floating geometric structures.
Generation prompt (Studio Theme — innovation lab):  
“Innovation lab with floating geometric structures, glass-and-metal studio atmosphere, holographic workflow panels showing agent roles and verification steps, subtle Parallax Studio branding colors (electric blue and violet), clean sci-fi startup aesthetic, no readable text, high detail, 4:3”

---

## 3. The Origin Story

The question behind this project was intentionally builder-first:

What if “autonomous” software engineering wasn’t a black box—what if it was a workflow you could watch, pause, retry, and audit?

So the core idea became a control loop:
- A founder submits a **blueprint** (raw text that can encode dependencies).
- The system turns blueprint lines into **jobs** and **tasks**.
- Each task runs under a specific agent role (architecture, coding, testing, debugging, devops, security, documentation, release).
- Progress streams to a **mobile Control Center** in real time via **SSE**.
- Every change is persisted as **JSON state** so hardening and triage are repeatable.

**Image placeholder (AI-generated):**
Alt text: Visionary architect with holographic planning overlays.
Generation prompt (Origin Theme — visionary architect with holograms):  
“Visionary architect with holograms, blueprint becomes layered execution steps, holographic timeline and agent-role icons, Parallax Studio palette (blue/violet), developer tools vibe, cinematic depth of field, no readable text, ultra-detailed, 3:2”

---

## 4. What This Project Is

**PROJECT NAME:** The 72H Founder Signal  
**TAGLINE:** Show how you think. Build what matters.  
**PROJECT DESCRIPTION:** A blueprint-driven orchestration reference implementation: an Express + TypeScript backend and an Expo (React Native) Control Center that monitors agent-role workflow runs, streams events in real time, and persists execution state for verification and triage.  
**CORE IDEA:** Blueprint thinking should become observable, inspectable work—so builders can collaborate effectively.

**KEY FEATURES**
- Blueprint ingestion (raw text -> jobs/tasks, minimal dependency inference)
- Role-based workflow engine (explicit phases + retries/rollback semantics)
- Live progress via Server-Sent Events (`GET /api/stream`)
- Deterministic replayable state via JSON persistence (`STATE_DIR`)
- Production readiness test hardening harness (phased: smoke → regression → deep → chaos → E2E)
- Mobile Control Center API client + UI scaffold (monitoring/controls)

**Image placeholder (AI-generated):**
Alt text: Abstract orchestration platform for blueprint-driven execution.
Generation prompt (Product Theme — abstract orchestration platform):  
“Abstract orchestration platform visualization, modular blocks connected by glowing lines, blueprint node feeding jobs/tasks nodes, event stream indicator, Parallax Studio tech poster style, electric blue and violet gradients, minimal layout, no readable text, cinematic lighting, 16:9”

---

## 5. Architecture Overview

This is a monorepo with a clear separation of concerns:

1) `backend/`: API + orchestration reference implementation  
2) `mobile/`: Expo React Native Control Center  
3) `app_core/test_hardening/`: phased verification pipeline + triage artifacts

### Backend (what runs the workflow)
Backend is an Express server that mounts routes under `/api` and provides:
- **Orchestration engine** (`backend/src/engine/workflowEngine.ts`)
  - Seeds jobs from blueprint state
  - Assigns pending tasks to agent-role workers
  - Executes each task and transitions job/run status
  - Emits audit events and updates metrics
- **Workflow streaming** (`backend/src/routes/stream.ts` + `backend/src/realtime/sseHub.ts`)
  - SSE endpoint: `GET /api/stream`
  - Broadcasts events like `task.created`, `task.enqueued`, `task.started`, `task.updated`, `run.finalized`
- **Task queues** (`backend/src/queue/agentTaskQueue.ts`)
  - In-memory per-agent-type queues (architecture, coding, testing, debugging, devops, security, documentation, release)
- **State persistence** (`backend/src/persistence/jsonPersistence.ts`)
  - Debounced JSON persistence to `STATE_DIR` (default: `./.state`)
  - Persists jobs/tasks/runs/blueprints/audit events/artifacts/agents as JSON
- **Blueprint creation** (`backend/src/routes/blueprints.ts`)
  - `POST /api/blueprints` creates a project blueprint and a running set of jobs
  - Dependency edges are inferred from blueprint lines using phrases like `after line N` / `depends on line N`

### Mobile (what you use to monitor)
Mobile is an Expo Router app with an API client in `mobile/src/lib/api.ts`, configured via:
- `EXPO_PUBLIC_API_BASE_URL` (Android emulator default: `http://10.0.2.2:4000`)

### Test hardening (how we reduce “it worked once”)
`app_core/test_hardening/` runs a strict ordered pipeline:
1. Inventory
2. Deps audit
3. Smoke
4. Regression
5. Deep
6. Chaos
7. E2E
8. Aggregate

**Image placeholder (AI-generated):**
Alt text: Layered glowing diagram of backend orchestration, SSE streaming, and JSON persistence.
Generation prompt (Architecture Theme — layered glowing system diagram):  
“Layered glowing system diagram, Express API gateway layer, workflow engine layer, SSE streaming layer, in-memory agent task queue layer, JSON persistence layer, Parallax Studio palette, translucent panels, electric blue/violet glow, minimal labels using symbols only (no readable text), crisp lines, dark background, 16:9”

---

## 6. Why Developers Will Like This Project

This project is built for contributors who care about clarity more than glamour.

Developer-positive design choices you can leverage immediately:
- **Inspectable execution**
  - SSE events make it possible to reason about what happened without stepping through a debugger.
- **Explicit workflow phases**
  - Agent roles map to code-defined workflow transitions (planning → coding → testing → security → debugging → deployment → documentation → release).
- **Replayable state**
  - JSON persistence means hardening runs can be triaged using saved state.
- **Test hardening is a first-class product surface**
  - The “production readiness” harness is not an afterthought; it’s organized as phases with aggregated reports and a triage/repair loop.
- **Typed validation**
  - Zod is used for request payload validation (example: blueprint creation).

**Image placeholder (AI-generated):**
Alt text: Collaborative futuristic workspace with a live workflow dashboard.
Generation prompt (Developers Theme — collaborative futuristic workspace):  
“Collaborative futuristic workspace, developers around a holographic dashboard showing workflow phases, SSE event stream visualized as glowing lines, Parallax Studio colors (electric blue + violet), realistic workspace + sci-fi overlay, no readable text, high detail, 3:2”

---

## 7. Current Status

**CURRENT STATUS: production-readiness focus**

What exists as a reference implementation right now:
- `backend/` orchestration engine + SSE streaming + JSON persistence + blueprint ingestion endpoints
- `mobile/` Expo Control Center scaffold and typed API client
- `app_core/test_hardening/` phased validation pipeline (smoke → regression → deep → chaos → E2E) and aggregated artifacts

What’s intentionally “reference” (grounded) today:
- Some orchestration behaviors are implemented as demo/reference logic inside the engine rather than fully wired to external LLM/tooling integrations.
- Admin endpoints include demo-style authorization (`x-role: admin`) and are not production-safe without additional security work.

If you like builder-first constraints, that’s the point: this is a system you can extend while keeping it observable and testable.

---

## 8. About the Architect

**FOUNDER:** Kevin De Vlieger  
**STUDIO:** Parallax Studio

Kevin’s architectural focus here is straightforward:
- build a workflow engine that models roles, phases, retries, and run finalization
- stream the run so humans can inspect it
- persist state so hardening isn’t guesswork

If you want to understand the system quickly, start in:
- `backend/src/engine/workflowEngine.ts`
- `backend/src/routes/stream.ts`
- `backend/src/persistence/jsonPersistence.ts`

---

## 9. Technical Co-Founder Invitation

Parallax Studio is inviting a **technical co-founder** (or senior builder who can operate like one) to help turn this reference into something more real, end-to-end, and product-grade.

We’re looking for builders who want to own a slice and deliver it:
- **Make orchestration execution real**
  - Replace reference/simulated steps with actual tool integrations, while keeping state + streaming correct.
- **Strengthen observability**
  - Enrich SSE events, audit payloads, and artifact metadata so triage becomes faster.
- **Harden reliability**
  - Improve retry/rollback semantics, add more verification checks, and tighten the hardening loop.
- **Finish the Control Center experience**
  - Build UI that helps founders and builders understand “what happened” and “what to do next.”

![I don’t build apps. I design them. Poster by Parallax Studio](./I%20don%27t%20build%20apps.%20I%20design%20them.png)

**Generation prompt (Recruitment Theme — epic technical co-founder poster):**  
“Epic technical co-founder recruitment poster, Parallax Studio branding, cosmic blueprint/dog-architect symbolism, headline text ‘I don’t build apps. I design them.’ with subline ‘Blueprinting ideas. Seeking a builder.’, also include ‘The 72H Founder Signal’ badge, dark starfield background with glowing blueprint overlays, no clutter, high contrast, high detail, 2:3”

To reach out (builder-focused, no mystique):
- Tell us what you built
- Tell us what slice you want to own (backend engine, SSE/observability, test hardening, or mobile Control Center)
- Propose a 2–3 week milestone with acceptance criteria

---

## 10. Running the Project

### Backend (`backend/`)
See `backend/README.md` for full API setup details.

```bash
cd backend
npm install
npm run dev
```

Backend dev server default port: `4000`. API routes are mounted under `/api`.

SSE endpoint:
- `GET http://localhost:4000/api/stream`

### Mobile Control Center (`mobile/`)
See `mobile/README.md`.

```bash
cd mobile
npm install
npm start
```

Set `EXPO_PUBLIC_API_BASE_URL` to point at the backend.
Default for Android emulator: `http://10.0.2.2:4000`.

### Test hardening (`app_core/test_hardening/`)
Run the full phased verification pipeline:

```bash
cd app_core/test_hardening
npm install
npm run run:verify
```

Optional triage mode (continues after first failed phase):
```bash
set ALLOW_PHASE_CONTINUE=1
npm run run:verify:partial
```

---

## 11. Closing Statement

Parallax Studio believes different perspectives can create real products—if we build systems that turn thinking into execution and execution into evidence.

This repo is a builder-first starting point for **The 72H Founder Signal**:
- blueprint ingestion
- role-based orchestration
- live streaming
- replayable state
- phased production readiness hardening

If you want to collaborate, pick a workflow slice, make it better end-to-end, and keep it observable and verifiable.

Repository: https://github.com/MyMindVentures/The72hFounderSignal_Orqestra

