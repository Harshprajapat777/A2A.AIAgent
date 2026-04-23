# UI Implementation Plan — Agent Observability Dashboard
### React 19 + Vite + Tailwind v4 + Framer Motion

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 19 + Vite | App foundation |
| Styling | Tailwind CSS v4 | Utility-first CSS (CSS-first config, no tailwind.config.js) |
| Animations | Framer Motion | Agent pipeline animations, panel transitions |
| Markdown | React Markdown + remark-gfm | Render generated reports |
| Icons | Lucide React | All UI icons |
| Routing | React Router v6 | 3 pages |
| HTTP | fetch / native WebSocket | Call FastAPI backend |

---

## Backend API Reference (Already Built)

| Method | Endpoint | Used by |
|--------|----------|---------|
| `POST` | `/research` | SearchBox — start a job |
| `WS` | `/ws/stream/{job_id}` | DashboardPage — live events |
| `GET` | `/jobs` | HomePage — recent jobs |
| `GET` | `/jobs/{id}` | DashboardPage — job status |
| `GET` | `/reports` | HomePage — past reports |
| `GET` | `/reports/{filename}` | ReportPage — report content |
| `GET` | `/agents` | DashboardPage — agent info |
| `GET` | `/health` | App startup check |

---

## WebSocket Events Reference (What the Dashboard Receives)

```json
{ "type": "agent_status", "agent": "SearchAgent",  "status": "working",   "task": "Searching AI trends" }
{ "type": "a2a_call",     "from_agent": "Orchestrator", "to_agent": "SearchAgent", "payload": "...", "status": "submitted" }
{ "type": "mcp_call",     "agent": "SearchAgent",  "tool": "search",      "input": "AI trends", "output": "10 results" }
{ "type": "log",          "agent": "AnalystAgent", "message": "Extracting insights..." }
{ "type": "done",         "job_id": "abc",         "report_id": "xyz",    "report_file": "report.md" }
```

---

## Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| `HomePage` | `/` | Search input + recent reports + example prompts |
| `DashboardPage` | `/research/:jobId` | Live 5-panel observability dashboard |
| `ReportPage` | `/reports/:filename` | Full rendered markdown report |

---

## Folder Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Router setup
│   ├── index.css                 # Tailwind v4 import + base styles
│   │
│   ├── api/
│   │   ├── client.js             # Base fetch wrapper + WS helper
│   │   └── endpoints.js          # All API calls in one place
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── ReportPage.jsx
│   │
│   └── components/
│       ├── layout/
│       │   ├── AppShell.jsx      # Outer layout wrapper
│       │   └── Header.jsx        # Top nav bar
│       │
│       ├── home/
│       │   ├── SearchBox.jsx     # Topic input + submit button
│       │   ├── ExamplePrompts.jsx # Clickable example research topics
│       │   └── ReportHistory.jsx # Past reports list
│       │
│       ├── dashboard/
│       │   ├── PipelineView.jsx  # Visual agent diagram
│       │   ├── AgentCard.jsx     # Single agent box (idle/working/done)
│       │   ├── AgentArrow.jsx    # Animated arrow between agents
│       │   ├── ProgressBar.jsx   # Overall pipeline progress
│       │   ├── A2ACallLog.jsx    # Live A2A message feed
│       │   ├── MCPCallLog.jsx    # Live MCP tool call feed
│       │   └── ActivityLog.jsx   # Chronological plain log
│       │
│       └── report/
│           ├── ReportViewer.jsx  # React Markdown renderer
│           └── ExportButton.jsx  # Download .md / copy to clipboard
```

---

## Build Phases

```
Phase UI-1 — Project Setup
  [ ] 1.  Create frontend/ with Vite + React 19
  [ ] 2.  Install all dependencies
  [ ] 3.  Configure Tailwind v4 (CSS-first, @tailwindcss/vite plugin)
  [ ] 4.  Setup React Router, base index.css, App.jsx

Phase UI-2 — API Layer
  [ ] 5.  api/client.js — fetch wrapper + WebSocket helper
  [ ] 6.  api/endpoints.js — all backend calls

Phase UI-3 — Layout
  [ ] 7.  AppShell.jsx — outer wrapper with dark background
  [ ] 8.  Header.jsx — logo + nav

Phase UI-4 — Home Page
  [ ] 9.  SearchBox.jsx — input + submit, POST /research
  [ ] 10. ExamplePrompts.jsx — clickable topic chips
  [ ] 11. ReportHistory.jsx — list from GET /reports
  [ ] 12. HomePage.jsx — compose all three

Phase UI-5 — Dashboard (Pipeline View)
  [ ] 13. AgentCard.jsx — status colours + Framer Motion pulse
  [ ] 14. AgentArrow.jsx — animated arrow, lights on a2a_call
  [ ] 15. PipelineView.jsx — 4 cards + arrows layout
  [ ] 16. ProgressBar.jsx — tracks pipeline step (0-100%)

Phase UI-6 — Dashboard (Log Panels)
  [ ] 17. A2ACallLog.jsx — renders a2a_call events
  [ ] 18. MCPCallLog.jsx — renders mcp_call events
  [ ] 19. ActivityLog.jsx — renders all log events

Phase UI-7 — Dashboard Page (Wire Everything)
  [ ] 20. DashboardPage.jsx — WebSocket connect, distribute events to panels
  [ ] 21. Auto-scroll logs, animate on new events

Phase UI-8 — Report
  [ ] 22. ReportViewer.jsx — React Markdown + remark-gfm
  [ ] 23. ExportButton.jsx — download .md + copy to clipboard
  [ ] 24. ReportPage.jsx — fetch report, render viewer

Phase UI-9 — Polish
  [ ] 25. Loading skeletons + error states
  [ ] 26. Responsive layout
  [ ] 27. Page transitions with Framer Motion
  [ ] 28. End-to-end test full flow
```

---

## Component → Event Map

| Component | Listens to | Updates on |
|-----------|-----------|------------|
| `AgentCard` | `agent_status` | Status colour, task label, pulse animation |
| `AgentArrow` | `a2a_call` | Flash/glow animation on active call |
| `A2ACallLog` | `a2a_call` | New row added at top |
| `MCPCallLog` | `mcp_call` | New row added at top |
| `ActivityLog` | `log`, all events | New line appended |
| `ProgressBar` | `agent_status` | Step increments |
| `ReportViewer` | `done` | Fetches + renders report |

---

## Agent Status → UI Colour

| Status | Colour | Animation |
|--------|--------|-----------|
| `idle` | Grey | None |
| `working` | Yellow / Amber | Pulse ring |
| `completed` | Green | Checkmark fade in |
| `failed` | Red | Shake |

---

*UI Implementation plan: April 2026*
*Backend API: Running on http://localhost:8000*
