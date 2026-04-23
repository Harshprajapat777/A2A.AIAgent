# Implementation Plan — Multi-Agent Research Assistant
### Pipeline, Submodules & Build Checklist

---

## The Pipeline (End to End)

```
┌─────────────────────────────────────────────────────────────────────┐
│              FRONTEND — Agent Observability Dashboard               │
│                      (React + Vite)                                 │
│  [Search Box] → [Pipeline View] + [A2A Log] + [MCP Log] + [Report] │
└────────────────────────────┬────────────────────────────────────────┘
                             │  HTTP / WebSocket
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER (FastAPI)                          │
│                                                                     │
│   POST /research   →   WebSocket /ws/stream   →   GET /reports      │
└────────────────────────────┬────────────────────────────────────────┘
                             │  Internal call
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR AGENT                              │
│                                                                     │
│   - Receives topic from API                                         │
│   - Breaks it into subtasks                                         │
│   - Delegates to specialist agents via A2A                          │
│   - Streams status updates back to API via WebSocket                │
└────────┬────────────────────┬───────────────────────┬──────────────┘
         │      A2A Protocol  │      A2A Protocol      │  A2A Protocol
         ↓                    ↓                        ↓
┌──────────────┐   ┌──────────────────┐   ┌─────────────────┐
│ SEARCH AGENT │   │  ANALYST AGENT   │   │  WRITER AGENT   │
│              │   │                  │   │                 │
│ - Gets query │   │ - Gets raw data  │   │ - Gets insights │
│ - Searches   │   │ - Extracts key   │   │ - Writes report │
│   the web    │   │   insights       │   │ - Saves as .md  │
│ - Returns    │   │ - Filters noise  │   │ - Returns path  │
│   raw results│   │ - Returns facts  │   │                 │
└──────┬───────┘   └────────┬─────────┘   └────────┬────────┘
       │ MCP                │ MCP                   │ MCP
       ↓                    ↓                       ↓
┌──────────────┐   ┌──────────────────┐   ┌─────────────────┐
│  MCP Server  │   │   MCP Server     │   │   MCP Server    │
│  Web Search  │   │   File System    │   │   File System   │
│  (Tavily)    │   │   (Read/Write)   │   │   (Write)       │
└──────────────┘   └──────────────────┘   └─────────────────┘
```

---

## What We Are Building

### 1. Backend — Python (FastAPI + A2A + MCP + Claude)

#### Submodule 1: `agents/`
The brains. Each agent is an independent module powered by Claude.

| File | Role | What it does |
|------|------|-------------|
| `orchestrator.py` | Manager Agent | Receives topic, creates a plan, delegates subtasks to other agents via A2A, collects results, streams progress |
| `search_agent.py` | Search Specialist | Receives a search query from orchestrator, calls MCP web search tool, returns raw search results |
| `analyst_agent.py` | Analysis Specialist | Receives raw search data, uses Claude to extract key insights, filters noise, returns structured facts |
| `writer_agent.py` | Writing Specialist | Receives insights, uses Claude to write a full structured markdown report, saves it via MCP file tool |

---

#### Submodule 2: `mcp_servers/`
The tools. MCP servers expose capabilities that agents can call.

| File | Tool it exposes | Used by |
|------|----------------|---------|
| `web_search_server.py` | `search(query)` → returns top results | Search Agent |
| `file_system_server.py` | `write_file(path, content)`, `read_file(path)` | Analyst Agent, Writer Agent |

---

#### Submodule 3: `a2a/`
The communication layer. Handles how agents talk to each other.

| File | What it does |
|------|-------------|
| `protocol.py` | Defines A2A message format — task request, task response, status updates |
| `agent_registry.py` | Keeps a map of all running agents and their addresses so orchestrator can find them |
| `task_manager.py` | Tracks task state — pending, in-progress, complete, failed |

---

#### Submodule 4: `api/`
The bridge between frontend and backend.

| File | What it does |
|------|-------------|
| `main.py` | FastAPI app entry point |
| `routes.py` | `POST /research` — starts a new research job |
| `websocket.py` | `WS /ws/stream/{job_id}` — streams live agent activity to frontend |
| `reports.py` | `GET /reports` — list all past reports, `GET /reports/{id}` — get one report |
| `models.py` | Pydantic schemas — request/response data shapes |

---

#### Submodule 5: `reports/`
Output folder. Every generated report lands here as a `.md` file.

```
reports/
  └── 2026-04-16_ai_software_dev.md
  └── 2026-04-16_competitor_analysis.md
  └── ...
```

---

#### Submodule 6: `config/`
Environment and app configuration.

| File | What it does |
|------|-------------|
| `settings.py` | Loads API keys, model name, ports from `.env` |
| `.env.example` | Template for required environment variables |

---

### 2. Frontend — Agent Observability Dashboard (React + Vite)

#### Submodule 7: `frontend/`
A real-time dashboard that visualizes the entire agent pipeline as it runs.
Not just a report viewer — you watch every A2A call, every MCP tool invocation, every agent status change live.

---

**Pages (React Router):**

| Page | Route | What the user sees |
|------|-------|-------------------|
| `HomePage` | `/` | Search box, example prompts, past reports list |
| `DashboardPage` | `/research/:id` | Full observability dashboard — all 5 panels live |
| `ReportPage` | `/reports/:id` | Full rendered report + export |

---

**The 5 Dashboard Panels (on DashboardPage):**

| Panel | Component | What it shows |
|-------|-----------|--------------|
| **1. Pipeline View** | `PipelineView.jsx` | Visual diagram — 4 agent boxes connected by arrows. Arrows animate and light up as A2A calls happen. Each agent shows status: idle (grey) → working (yellow pulse) → done (green) |
| **2. A2A Call Log** | `A2ACallLog.jsx` | Live feed of every agent-to-agent message — sender, receiver, task payload, status (submitted / working / completed / failed) |
| **3. MCP Tool Calls** | `MCPCallLog.jsx` | Live feed of every tool invocation — which agent called which tool, input params, output summary |
| **4. Activity Log** | `ActivityLog.jsx` | Plain chronological log of everything — all agents, all events, timestamped |
| **5. Report Viewer** | `ReportViewer.jsx` | Appears when WriterAgent completes — renders the markdown report inline |

---

**Supporting Components:**

| Component | What it does |
|-----------|-------------|
| `SearchBox.jsx` | Input + submit — fires `POST /research`, redirects to `/research/:id` |
| `AgentCard.jsx` | Single agent box in pipeline view — name, status badge, current task |
| `AgentArrow.jsx` | Animated arrow between two agents in pipeline view — pulses on active A2A call |
| `LogEntry.jsx` | Single row in A2A or MCP log — colour coded by agent and status |
| `ProgressBar.jsx` | Overall pipeline progress across top of dashboard (0% → 100%) |
| `ReportHistory.jsx` | List of past reports on home page |
| `ExportButton.jsx` | Download report as `.md` or copy to clipboard |

---

**WebSocket Event Types streamed from backend:**

```json
// Agent status change → updates PipelineView
{ "type": "agent_status", "agent": "SearchAgent", "status": "working", "task": "Searching AI trends" }

// A2A call → updates A2ACallLog + animates arrow
{ "type": "a2a_call", "from": "Orchestrator", "to": "SearchAgent", "payload": "find AI trends 2025", "status": "submitted" }

// MCP tool call → updates MCPCallLog
{ "type": "mcp_call", "agent": "SearchAgent", "tool": "search", "input": "AI trends 2025", "output": "10 results found" }

// Plain log line → updates ActivityLog
{ "type": "log", "agent": "AnalystAgent", "message": "Extracting key insights from 10 sources..." }

// Pipeline done → shows ReportViewer
{ "type": "done", "report_id": "abc123", "report_path": "reports/ai_trends.md" }
```

---

## Full Project Folder Structure

```
D:\A2A\
│
├── Project.md                        # Project overview
├── Implementation.md                 # This file
├── requirements.txt                  # Python dependencies
├── .env.example                      # API key template
│
├── agents/                           # SUBMODULE 1 — AI Agents
│   ├── __init__.py
│   ├── orchestrator.py
│   ├── search_agent.py
│   ├── analyst_agent.py
│   └── writer_agent.py
│
├── mcp_servers/                      # SUBMODULE 2 — MCP Tool Servers
│   ├── __init__.py
│   ├── web_search_server.py
│   └── file_system_server.py
│
├── a2a/                              # SUBMODULE 3 — A2A Protocol Layer
│   ├── __init__.py
│   ├── protocol.py
│   ├── agent_registry.py
│   └── task_manager.py
│
├── api/                              # SUBMODULE 4 — FastAPI Backend
│   ├── __init__.py
│   ├── main.py
│   ├── routes.py
│   ├── websocket.py
│   ├── reports.py
│   └── models.py
│
├── config/                           # SUBMODULE 6 — Config
│   ├── settings.py
│   └── .env.example
│
├── reports/                          # SUBMODULE 5 — Output Folder
│   └── .gitkeep
│
└── frontend/                         # SUBMODULE 7 — React + Vite (Observability Dashboard)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx                  # App entry point
    │   ├── App.jsx                   # Router setup
    │   ├── pages/
    │   │   ├── HomePage.jsx          # Search box + report history
    │   │   ├── DashboardPage.jsx     # 5-panel live observability dashboard
    │   │   └── ReportPage.jsx        # Full report viewer
    │   └── components/
    │       ├── SearchBox.jsx         # Topic input + submit
    │       ├── PipelineView.jsx      # Visual agent diagram with animated arrows
    │       ├── AgentCard.jsx         # Single agent box — name + status
    │       ├── AgentArrow.jsx        # Animated arrow between agents
    │       ├── A2ACallLog.jsx        # Live A2A message feed
    │       ├── MCPCallLog.jsx        # Live MCP tool call feed
    │       ├── ActivityLog.jsx       # Chronological plain text log
    │       ├── ProgressBar.jsx       # Overall pipeline progress
    │       ├── ReportViewer.jsx      # Inline markdown renderer
    │       ├── ReportHistory.jsx     # Past reports list on home page
    │       └── ExportButton.jsx      # Download / copy report
```

---

## Build Order (Step by Step)

```
Phase 1 — Foundation
  [ ] 1. Setup Python environment + install dependencies
  [ ] 2. Setup .env with API keys (Anthropic, Tavily)
  [ ] 3. Build config/settings.py

Phase 2 — MCP Servers (Tools)
  [ ] 4. Build mcp_servers/web_search_server.py
  [ ] 5. Build mcp_servers/file_system_server.py
  [ ] 6. Test both MCP servers independently

Phase 3 — A2A Layer
  [ ] 7. Build a2a/protocol.py (message format)
  [ ] 8. Build a2a/agent_registry.py
  [ ] 9. Build a2a/task_manager.py

Phase 4 — Agents
  [ ] 10. Build agents/search_agent.py  + connect to MCP web search
  [ ] 11. Build agents/analyst_agent.py + connect to MCP file system
  [ ] 12. Build agents/writer_agent.py  + connect to MCP file system
  [ ] 13. Build agents/orchestrator.py  + connect to all 3 via A2A
  [ ] 14. Test full agent pipeline from CLI

Phase 5 — API Layer
  [ ] 15. Build api/models.py
  [ ] 16. Build api/routes.py (POST /research)
  [ ] 17. Build api/websocket.py (WS /ws/stream)
  [ ] 18. Build api/reports.py (GET /reports)
  [ ] 19. Build api/main.py
  [ ] 20. Test API with Postman / curl

Phase 6 — Frontend (Observability Dashboard)
  [ ] 21. Init React + Vite app (npm create vite)
  [ ] 22. Build HomePage — SearchBox + ReportHistory
  [ ] 23. Build PipelineView — 4 agent boxes + AgentArrow animations
  [ ] 24. Build A2ACallLog — live A2A message feed via WebSocket
  [ ] 25. Build MCPCallLog — live MCP tool call feed via WebSocket
  [ ] 26. Build ActivityLog — chronological event log
  [ ] 27. Wire all panels into DashboardPage with WebSocket
  [ ] 28. Build ReportViewer — markdown render on pipeline complete
  [ ] 29. Build ReportPage + ExportButton
  [ ] 30. End-to-end test full flow

Phase 7 — Polish & Demo Prep
  [ ] 29. Add loading states and animations
  [ ] 30. Test with 3–4 real research topics
  [ ] 31. Prepare demo script for team
```

---

## API Keys Required

| Key | Where to get it | Used for |
|-----|----------------|---------|
| `ANTHROPIC_API_KEY` | console.anthropic.com | Powers all 4 agents (Claude) |
| `TAVILY_API_KEY` | tavily.com | Web search in Search Agent |

---

## Ports

| Service | Port |
|---------|------|
| FastAPI backend | `8000` |
| React + Vite frontend | `3000` |
| MCP Web Search Server | `8001` |
| MCP File System Server | `8002` |
| Search Agent (A2A) | `8010` |
| Analyst Agent (A2A) | `8011` |
| Writer Agent (A2A) | `8012` |
| Orchestrator Agent (A2A) | `8013` |

---

*Implementation plan finalized: April 2026*
