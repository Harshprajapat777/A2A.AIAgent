"""
Search Agent
Receives a research topic → searches the web via MCP Tavily tool
→ returns raw results as JSON string.
"""

from __future__ import annotations
import asyncio
import json
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.base_agent import BaseAgent
from a2a.protocol import TaskRequest, TaskResult, TaskStatus
from mcp_servers.web_search_server import search as tavily_search


class SearchAgent(BaseAgent):

    def __init__(self):
        super().__init__("SearchAgent")

    async def run(self, request: TaskRequest) -> TaskResult:
        job_id = request.job_id
        topic  = request.input

        try:
            await self.emit_status(job_id, TaskStatus.WORKING, f"Searching: {topic}")
            await self.emit_log(job_id, f"Starting web search for: '{topic}'")

            # ── MCP Tool Call: search ─────────────────────────────────────────
            await self.emit_mcp(job_id, "search", inp=topic)
            raw_json = await asyncio.to_thread(tavily_search, topic, 8)
            results  = json.loads(raw_json)

            # Count actual source results (exclude the synthesized answer entry)
            sources = [r for r in results if r.get("type") == "source"]
            await self.emit_mcp(
                job_id, "search",
                inp=topic,
                out=f"{len(sources)} sources found"
            )
            await self.emit_log(job_id, f"Found {len(sources)} sources for '{topic}'")
            # ─────────────────────────────────────────────────────────────────

            await self.emit_status(job_id, TaskStatus.COMPLETED, f"Found {len(sources)} sources")
            return self.ok(request, raw_json)

        except Exception as e:
            await self.emit_log(job_id, f"Search failed: {e}")
            await self.emit_status(job_id, TaskStatus.FAILED, str(e))
            return self.fail(request, str(e))


# ── Singleton ──────────────────────────────────────────────────────────────────
search_agent = SearchAgent()
