"""
Analyst Agent
Receives raw search results → uses Claude to extract key insights,
remove noise, and return structured facts ready for the writer.
"""

from __future__ import annotations
import json
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.base_agent import BaseAgent
from a2a.protocol import TaskRequest, TaskResult, TaskStatus


SYSTEM_PROMPT = """You are a research analyst. Your job is to read raw web search results
and extract the most important, accurate, and relevant insights.

Output a clean structured analysis with:
1. KEY FINDINGS     — 5-8 bullet points of the most important facts
2. TRENDS           — 3-5 emerging patterns or developments
3. KEY PLAYERS      — Notable companies, people, or projects mentioned
4. GAPS & CAVEATS   — What is unclear, contested, or missing from the data
5. RECOMMENDED FOCUS AREAS — 3 angles the writer should emphasize in the report

Be concise, factual, and specific. Cite sources where possible (url or title).
Remove duplicate information. Ignore ads, navigation text, or irrelevant content."""


class AnalystAgent(BaseAgent):

    def __init__(self):
        super().__init__("AnalystAgent")

    async def run(self, request: TaskRequest) -> TaskResult:
        job_id = request.job_id

        try:
            # Context carries the original topic from orchestrator
            topic = request.context.get("topic", "the given topic")

            await self.emit_status(job_id, TaskStatus.WORKING, f"Analyzing search results")
            await self.emit_log(job_id, f"Received {len(request.input)} chars of raw search data")
            await self.emit_log(job_id, "Extracting key insights with Claude...")

            # Parse incoming JSON to show source count in logs
            try:
                sources = [r for r in json.loads(request.input) if r.get("type") == "source"]
                await self.emit_log(job_id, f"Processing {len(sources)} sources...")
            except Exception:
                pass

            # ── Claude call ───────────────────────────────────────────────────
            user_prompt = f"""Research topic: {topic}

Raw search results:
{request.input}

Please analyze these results and provide your structured insights."""

            insights = await self.ask_claude(
                system     = SYSTEM_PROMPT,
                user       = user_prompt,
                max_tokens = 4096,
            )
            # ─────────────────────────────────────────────────────────────────

            await self.emit_log(job_id, "Analysis complete — insights extracted")
            await self.emit_status(job_id, TaskStatus.COMPLETED, "Insights ready")
            return self.ok(request, insights)

        except Exception as e:
            await self.emit_log(job_id, f"Analysis failed: {e}")
            await self.emit_status(job_id, TaskStatus.FAILED, str(e))
            return self.fail(request, str(e))


# ── Singleton ──────────────────────────────────────────────────────────────────
analyst_agent = AnalystAgent()
