# Multi-Agent Research Assistant
### Built with A2A (Agent-to-Agent) + MCP (Model Context Protocol)

---

## What Is This Project?

This is a **Multi-Agent Research Assistant** — you give it a topic, and a team of AI agents automatically researches it, analyzes the findings, and writes you a full report.

No copy-pasting. No manual searching. No summarizing. Just one command → full report.

---

## How Harsh Uses This (Real Example)

**Step 1 — Open terminal, type one command:**
```
python main.py "How is AI changing software development in 2025?"
```

**Step 2 — Watch agents work live in your terminal:**
```
[Orchestrator]  Received task. Delegating to specialist agents...
[SearchAgent]   Searching the web for: "AI changing software development 2025"
[SearchAgent]   Found 12 relevant sources. Sending to Analyst...
[AnalystAgent]  Reading and analyzing 12 sources...
[AnalystAgent]  Key insights extracted. Sending to Writer...
[WriterAgent]   Writing structured report...
[WriterAgent]   Report saved → reports/ai_software_dev_2025.md
[Orchestrator]  Done! Report ready in 28 seconds.
```

**Step 3 — Open the generated report:**
```
reports/ai_software_dev_2025.md
```

That's it. You asked one question. Three agents did the work.

---

## More Examples of What You Can Ask

```bash
python main.py "Research our competitors: GitHub Copilot vs Cursor vs Tabnine"
python main.py "What are the latest trends in React and Next.js?"
python main.py "Summarize best practices for microservices architecture"
python main.py "How are companies using AI agents in customer support?"
python main.py "Research the A2A protocol and its adoption in 2025"
```

Each one → fully researched, structured report in under a minute.

---

## How It Works Under the Hood

### The Architecture

```
You (Harsh)
    |
    | types a question
    ↓
┌─────────────────────────────────────┐
│         Orchestrator Agent          │  ← The "Manager"
│  (Reads your question, makes a plan)│
└──────────┬──────────────────────────┘
           │  A2A Protocol (Agent talks to Agent)
    ┌──────┼──────────────┐
    ↓      ↓              ↓
┌───────┐ ┌──────────┐ ┌────────┐
│Search │ │ Analyst  │ │ Writer │  ← Specialist Agents
│Agent  │ │  Agent   │ │ Agent  │
└───┬───┘ └────┬─────┘ └───┬────┘
    │          │            │
    ↓          ↓            ↓
┌───────┐ ┌──────────┐ ┌────────┐
│  MCP  │ │   MCP    │ │  MCP   │  ← Tools (via MCP Protocol)
│ Web   │ │   File   │ │  File  │
│Search │ │  System  │ │ System │
└───────┘ └──────────┘ └────────┘
```

### The 4 Agents Explained Simply

| Agent | Role | What it does |
|-------|------|-------------|
| **Orchestrator** | The Manager | Reads your question, breaks it into tasks, assigns to agents, collects results |
| **Search Agent** | The Researcher | Goes on the web, finds relevant articles, pages, data |
| **Analyst Agent** | The Analyst | Reads all the search results, extracts key insights, removes noise |
| **Writer Agent** | The Writer | Takes insights and writes a clean, structured markdown report |

### The 2 Protocols Explained Simply

| Protocol | What it enables |
|----------|----------------|
| **A2A** | Orchestrator tells SearchAgent "go search this", SearchAgent replies "here are results" — agents talking to agents |
| **MCP** | SearchAgent uses a web search tool, WriterAgent saves a file — agents using real tools |

---

## Project Structure

```
D:\A2A\
│
├── main.py                    # Entry point — run this
├── Project.md                 # This file
├── requirements.txt           # Python dependencies
│
├── agents/
│   ├── orchestrator.py        # Manager agent — coordinates everything
│   ├── search_agent.py        # Searches the web
│   ├── analyst_agent.py       # Analyzes and extracts insights
│   └── writer_agent.py        # Writes the final report
│
├── mcp_servers/
│   ├── web_search_server.py   # MCP server: gives agents web search ability
│   └── file_system_server.py  # MCP server: gives agents file read/write ability
│
├── a2a/
│   └── protocol.py            # A2A communication layer between agents
│
└── reports/                   # Output folder — all generated reports land here
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.11+ |
| AI Model | Claude (claude-sonnet-4-6) via Anthropic API |
| Agent Protocol | Google A2A SDK |
| Tool Protocol | MCP (Model Context Protocol) |
| Web Search | Tavily API (or DuckDuckGo free) |
| Report Format | Markdown |

---

## What This Demonstrates to Your Team

1. **A2A in action** — Watch agents delegate tasks to each other with a real protocol, not just function calls
2. **MCP in action** — Watch agents pick up and use tools (web search, file system) through a standardized interface
3. **Multi-agent coordination** — Orchestrator manages a pipeline of specialized agents
4. **Real output** — Not a toy — produces genuinely useful research reports
5. **Extensibility** — Easy to add new agents (e.g., a "Fact Checker" agent, a "Chart Generator" agent)

---

## Future Extensions (Post-Demo)

Once the team sees this working, here's what you can add:

- **Slack Agent** — post the report directly to a Slack channel
- **Email Agent** — email the report to stakeholders
- **Competitor Monitor** — schedule it to run weekly on competitors
- **Code Review Agent** — point it at a GitHub PR, get a review
- **Customer Feedback Analyzer** — feed it support tickets, get insights
- **Sales Intel Agent** — give it a company name, get a full sales briefing

---

## Setup (Coming Soon)

```bash
# Clone / navigate to project
cd D:\A2A

# Install dependencies
pip install -r requirements.txt

# Set your API keys
set ANTHROPIC_API_KEY=your_key_here
set TAVILY_API_KEY=your_key_here

# Run it
python main.py "Your research topic here"
```

---

*Project started: April 2026*
*Stack: Python + A2A + MCP + Claude*
