# A2A AI Agent — Multi-Agent Research Assistant

An automated research pipeline powered by Claude AI. Give it a question, and a team of coordinated AI agents searches the web, analyzes findings, and produces a full markdown report — all observable in real time.

<img width="1551" height="742" alt="image" src="https://github.com/user-attachments/assets/31e806fb-4c7d-4fb1-8e78-1221efdcf4d8" />
<img width="1554" height="749" alt="image" src="https://github.com/user-attachments/assets/76804689-f6e3-4fcc-bb4c-fe0fceaa4e28" />
<img width="1525" height="750" alt="image" src="https://github.com/user-attachments/assets/5b1e1c10-7f35-404c-869f-dc347be85ad5" />

---

## How It Works

```
User Query
    ↓
[FastAPI Backend] ←→ [React Frontend]
    ↓
[Orchestrator Agent]  (A2A Protocol)
    ├─→ [Search Agent]   → MCP Web Search  → Raw Results
    ├─→ [Analyst Agent]  → MCP File System → Key Insights
    └─→ [Writer Agent]   → MCP File System → Final Report
    ↓
reports/  (markdown output)
```

Four specialist agents communicate over the **Agent-to-Agent (A2A) protocol** via HTTP. Tool calls (web search, file I/O) go through **MCP servers**. The frontend streams every event live via WebSocket.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Agents | Claude (Anthropic) via `anthropic` SDK |
| Agent Protocol | A2A (custom HTTP-based) |
| Tool Protocol | MCP (Model Context Protocol) |
| Web Search | Tavily API |
| Backend | FastAPI + WebSockets |
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- [Anthropic API key](https://console.anthropic.com/)
- [Tavily API key](https://tavily.com/)

---

## Setup

### 1. Clone & configure environment

```bash
git clone https://github.com/Harshprajapat777/A2A.AIAgent.git
cd A2A.AIAgent

cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
ANTHROPIC_API_KEY=your_anthropic_key
TAVILY_API_KEY=your_tavily_key
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## Running

**Backend** (from project root):

```bash
uvicorn api.main:app --reload --port 8080
```

**Frontend** (in a second terminal):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Powers all four Claude agents |
| `TAVILY_API_KEY` | Yes | — | Web search capability |
| `MODEL_NAME` | No | `claude-sonnet-4-6` | Claude model to use |
| `API_PORT` | No | `8080` | FastAPI backend port |
| `MCP_WEB_SEARCH_PORT` | No | `8001` | Web search MCP server port |
| `MCP_FILE_SYSTEM_PORT` | No | `8002` | File system MCP server port |
| `SEARCH_AGENT_PORT` | No | `8010` | Search agent A2A port |
| `ANALYST_AGENT_PORT` | No | `8011` | Analyst agent A2A port |
| `WRITER_AGENT_PORT` | No | `8012` | Writer agent A2A port |
| `ORCHESTRATOR_PORT` | No | `8013` | Orchestrator agent A2A port |

---

## Project Structure

```
A2A/
├── agents/              # Four AI agents (orchestrator, search, analyst, writer)
├── a2a/                 # A2A protocol layer (registry, task manager, message types)
├── api/                 # FastAPI backend (routes, websocket streaming, report endpoints)
├── config/              # Settings loader (reads .env, validates required keys)
├── mcp_servers/         # MCP tool servers (web search, file system)
├── frontend/            # React app (dashboard, report viewer, live pipeline view)
├── reports/             # Generated markdown research reports
├── requirements.txt
└── .env.example
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/research` | Start a new research job |
| `GET` | `/reports` | List all saved reports |
| `GET` | `/reports/{id}` | Retrieve a specific report |
| `WS` | `/ws/stream/{job_id}` | Stream live agent events |
| `GET` | `/health` | Health check |

---

## Frontend Pages

- **Home** — Search box + report history
- **Dashboard** — Live pipeline view: agent diagram, A2A call log, MCP call log, activity feed
- **Report** — Rendered markdown report with export button

---

## License

MIT
