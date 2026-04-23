"""
A2A Task Manager
Tracks state of every research job and manages the WebSocket event queue.

Producer side  — agents call emit() to push events
Consumer side  — WebSocket handler calls subscribe() to stream events to frontend

Each job gets its own asyncio.Queue so multiple jobs can run in parallel.
"""

from __future__ import annotations
import asyncio
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import AsyncGenerator, Any

from a2a.protocol import (
    TaskStatus,
    WSEvent,
    AgentStatusEvent,
    A2ACallEvent,
    MCPCallEvent,
    LogEvent,
    DoneEvent,
)


# ── Job state ─────────────────────────────────────────────────────────────────

@dataclass
class Job:
    job_id:     str
    topic:      str
    status:     TaskStatus              = TaskStatus.SUBMITTED
    report_id:  str                     = ""
    report_file: str                    = ""
    created_at: str                     = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    events:     list[dict]              = field(default_factory=list)   # full history
    _queue:     asyncio.Queue           = field(default_factory=asyncio.Queue, repr=False)

    def to_dict(self) -> dict:
        return {
            "job_id":      self.job_id,
            "topic":       self.topic,
            "status":      self.status,
            "report_id":   self.report_id,
            "report_file": self.report_file,
            "created_at":  self.created_at,
            "event_count": len(self.events),
        }


# ── Manager ───────────────────────────────────────────────────────────────────

class TaskManager:
    """
    Singleton. Import and use anywhere:
        from a2a.task_manager import task_manager
        await task_manager.emit(job_id, LogEvent(...))
    """

    def __init__(self):
        self._jobs: dict[str, Job] = {}

    # ── Job lifecycle ──────────────────────────────────────────────────────────

    def create_job(self, topic: str) -> str:
        """Create a new research job. Returns job_id."""
        job_id = str(uuid.uuid4())
        self._jobs[job_id] = Job(job_id=job_id, topic=topic)
        return job_id

    def get_job(self, job_id: str) -> Job | None:
        return self._jobs.get(job_id)

    def all_jobs(self) -> list[dict]:
        return [j.to_dict() for j in reversed(list(self._jobs.values()))]

    def mark_done(self, job_id: str, report_id: str, report_file: str) -> None:
        job = self._get(job_id)
        job.status      = TaskStatus.COMPLETED
        job.report_id   = report_id
        job.report_file = report_file

    def mark_failed(self, job_id: str) -> None:
        job = self._get(job_id)
        job.status = TaskStatus.FAILED

    # ── Event emission (agents call these) ────────────────────────────────────

    async def emit(self, job_id: str, event: Any) -> None:
        """Push any WSEvent into the job's queue and store in history."""
        job = self._get(job_id)
        data = event.model_dump()
        job.events.append(data)
        await job._queue.put(data)

    # ── Convenience emitters ──────────────────────────────────────────────────

    async def emit_agent_status(self, job_id: str, agent: str, status: TaskStatus, task: str = "") -> None:
        await self.emit(job_id, AgentStatusEvent(agent=agent, status=status, task=task))

    async def emit_a2a_call(self, job_id: str, from_agent: str, to_agent: str, payload: str, status: TaskStatus = TaskStatus.SUBMITTED) -> None:
        await self.emit(job_id, A2ACallEvent(from_agent=from_agent, to_agent=to_agent, payload=payload, status=status))

    async def emit_mcp_call(self, job_id: str, agent: str, tool: str, input: str = "", output: str = "") -> None:
        await self.emit(job_id, MCPCallEvent(agent=agent, tool=tool, input=input, output=output))

    async def emit_log(self, job_id: str, agent: str, message: str) -> None:
        await self.emit(job_id, LogEvent(agent=agent, message=message))

    async def emit_done(self, job_id: str, report_id: str, report_file: str) -> None:
        self.mark_done(job_id, report_id, report_file)
        await self.emit(job_id, DoneEvent(job_id=job_id, report_id=report_id, report_file=report_file))
        # Sentinel — tells subscribe() the stream is over
        await self._get(job_id)._queue.put(None)

    async def emit_error(self, job_id: str, agent: str, message: str) -> None:
        self.mark_failed(job_id)
        await self.emit(job_id, LogEvent(agent=agent, message=f"ERROR: {message}"))
        await self._get(job_id)._queue.put(None)

    # ── WebSocket subscription (API layer calls this) ─────────────────────────

    async def subscribe(self, job_id: str) -> AsyncGenerator[dict, None]:
        """
        Async generator — yields events as they arrive.
        WebSocket handler iterates this and sends each event to the browser.
        Stops when it receives the None sentinel (job done or failed).
        """
        job = self._get(job_id)

        # Replay any events that arrived before the WS connected
        for past_event in job.events:
            yield past_event

        # Then stream live events
        while True:
            event = await job._queue.get()
            if event is None:
                break
            yield event

    # ── Internal ──────────────────────────────────────────────────────────────

    def _get(self, job_id: str) -> Job:
        job = self._jobs.get(job_id)
        if not job:
            raise KeyError(f"Job '{job_id}' not found")
        return job


# ── Singleton instance ────────────────────────────────────────────────────────
task_manager = TaskManager()
