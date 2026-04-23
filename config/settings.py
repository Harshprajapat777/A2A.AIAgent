import os
from dotenv import load_dotenv

load_dotenv()

# ── API Keys ──────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
TAVILY_API_KEY    = os.getenv("TAVILY_API_KEY", "")

# ── Model ─────────────────────────────────────────────────────────────────────
MODEL_NAME = os.getenv("MODEL_NAME", "claude-sonnet-4-6")

# ── Ports ─────────────────────────────────────────────────────────────────────
API_PORT              = int(os.getenv("API_PORT",              "8080"))
MCP_WEB_SEARCH_PORT   = int(os.getenv("MCP_WEB_SEARCH_PORT",   "8001"))
MCP_FILE_SYSTEM_PORT  = int(os.getenv("MCP_FILE_SYSTEM_PORT",  "8002"))
SEARCH_AGENT_PORT     = int(os.getenv("SEARCH_AGENT_PORT",     "8010"))
ANALYST_AGENT_PORT    = int(os.getenv("ANALYST_AGENT_PORT",    "8011"))
WRITER_AGENT_PORT     = int(os.getenv("WRITER_AGENT_PORT",     "8012"))
ORCHESTRATOR_PORT     = int(os.getenv("ORCHESTRATOR_PORT",     "8013"))

# ── Agent URLs (A2A) ──────────────────────────────────────────────────────────
SEARCH_AGENT_URL     = f"http://localhost:{SEARCH_AGENT_PORT}"
ANALYST_AGENT_URL    = f"http://localhost:{ANALYST_AGENT_PORT}"
WRITER_AGENT_URL     = f"http://localhost:{WRITER_AGENT_PORT}"
ORCHESTRATOR_URL     = f"http://localhost:{ORCHESTRATOR_PORT}"

# ── MCP Server URLs ───────────────────────────────────────────────────────────
MCP_WEB_SEARCH_URL   = f"http://localhost:{MCP_WEB_SEARCH_PORT}"
MCP_FILE_SYSTEM_URL  = f"http://localhost:{MCP_FILE_SYSTEM_PORT}"

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

# ── Validation ────────────────────────────────────────────────────────────────
def validate():
    missing = []
    if not ANTHROPIC_API_KEY:
        missing.append("ANTHROPIC_API_KEY")
    if not TAVILY_API_KEY:
        missing.append("TAVILY_API_KEY")
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Copy .env.example to .env and fill in your keys."
        )
