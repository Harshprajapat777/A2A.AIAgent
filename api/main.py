"""
FastAPI Application — Main Entry Point
Mounts all routes, configures CORS, validates config on startup.

Run with:
    uvicorn api.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import validate
from api.routes    import router as research_router
from api.websocket import router as ws_router
from api.reports   import router as reports_router

# ── Validate keys before anything starts ──────────────────────────────────────
validate()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "Multi-Agent Research Assistant",
    description = "A2A + MCP powered research pipeline with real-time observability",
    version     = "1.0.0",
)

# ── CORS (allow React frontend on port 3000) ──────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(research_router, tags=["Research"])
app.include_router(ws_router,       tags=["Stream"])
app.include_router(reports_router,  tags=["Reports"])


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "service": "multi-agent-research-assistant"}


# ── Agent registry info ───────────────────────────────────────────────────────
@app.get("/agents", tags=["System"])
async def list_agents():
    """List all registered A2A agents and their capabilities."""
    from a2a.agent_registry import AgentRegistry
    return AgentRegistry.all_cards()
