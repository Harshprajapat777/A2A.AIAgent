"""
Orchestrator Agent
The manager. Receives a research topic + job_id, breaks it into tasks,
delegates to SearchAgent → AnalystAgent → WriterAgent via A2A,
and emits real-time events throughout so the frontend can visualize everything.
"""

from __future__ import annotations
import uuid
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.base_agent import BaseAgent
from agents.search_agent  import search_agent
from agents.analyst_agent import analyst_agent
from agents.writer_agent  import writer_agent

from a2a.protocol  import TaskRequest, TaskResult, TaskStatus
from a2a.task_manager import task_manager


class Orchestrator(BaseAgent):

    def __init__(self):
        super().__init__("Orchestrator")

    async def run_job(self, job_id: str, topic: str) -> str:
        """
        Main entry point called by the API layer.
        Runs the full pipeline: Search → Analyse → Write.
        Returns the report filename on success, raises on failure.
        """

        try:
            # ── Start ─────────────────────────────────────────────────────────
            await self.emit_status(job_id, TaskStatus.WORKING, f"Planning research: {topic}")
            await self.emit_log(job_id, f"New research job started: '{topic}'")
            await self.emit_log(job_id, "Pipeline: Search → Analyse → Write")

            # ── Step 1: Search ────────────────────────────────────────────────
            search_result = await self._call_agent(
                job_id     = job_id,
                to_agent   = search_agent,
                input_text = topic,
                context    = {"topic": topic},
                description = f"Search web for: {topic}",
            )
            if search_result.status == TaskStatus.FAILED:
                raise RuntimeError(f"SearchAgent failed: {search_result.error}")

            # ── Step 2: Analyse ───────────────────────────────────────────────
            analyst_result = await self._call_agent(
                job_id     = job_id,
                to_agent   = analyst_agent,
                input_text = search_result.output,
                context    = {"topic": topic},
                description = "Analyse search results",
            )
            if analyst_result.status == TaskStatus.FAILED:
                raise RuntimeError(f"AnalystAgent failed: {analyst_result.error}")

            # ── Step 3: Write ─────────────────────────────────────────────────
            writer_result = await self._call_agent(
                job_id     = job_id,
                to_agent   = writer_agent,
                input_text = analyst_result.output,
                context    = {"topic": topic},
                description = f"Write report on: {topic}",
            )
            if writer_result.status == TaskStatus.FAILED:
                raise RuntimeError(f"WriterAgent failed: {writer_result.error}")

            # ── Done ──────────────────────────────────────────────────────────
            report_filename = writer_result.output
            report_id       = str(uuid.uuid4())[:8]

            await self.emit_status(job_id, TaskStatus.COMPLETED, "All done")
            await self.emit_log(job_id, f"Pipeline complete. Report: {report_filename}")
            await task_manager.emit_done(job_id, report_id, report_filename)

            return report_filename

        except Exception as e:
            await self.emit_log(job_id, f"Orchestrator error: {e}")
            await self.emit_status(job_id, TaskStatus.FAILED, str(e))
            await task_manager.emit_error(job_id, self.name, str(e))
            raise

    # ── Internal: A2A delegation ──────────────────────────────────────────────

    async def _call_agent(
        self,
        job_id:      str,
        to_agent:    BaseAgent,
        input_text:  str,
        context:     dict,
        description: str,
    ) -> TaskResult:
        """
        Simulates an A2A call to a specialist agent.
        Emits a2a_call events before + after so the frontend sees the full picture.
        """

        task_id = str(uuid.uuid4())
        request = TaskRequest(
            task_id    = task_id,
            job_id     = job_id,
            from_agent = self.name,
            to_agent   = to_agent.name,
            input      = input_text,
            context    = context,
        )

        # ── Emit: task submitted ───────────────────────────────────────────
        await task_manager.emit_a2a_call(
            job_id     = job_id,
            from_agent = self.name,
            to_agent   = to_agent.name,
            payload    = description,
            status     = TaskStatus.SUBMITTED,
        )
        await self.emit_log(job_id, f"Delegating to {to_agent.name}: {description}")

        # ── Run the agent ──────────────────────────────────────────────────
        result = await to_agent.run(request)

        # ── Emit: task result ──────────────────────────────────────────────
        await task_manager.emit_a2a_call(
            job_id     = job_id,
            from_agent = to_agent.name,
            to_agent   = self.name,
            payload    = f"Status: {result.status.value}" + (f" | {result.error}" if result.error else ""),
            status     = result.status,
        )

        return result


# ── Singleton ──────────────────────────────────────────────────────────────────
orchestrator = Orchestrator()
