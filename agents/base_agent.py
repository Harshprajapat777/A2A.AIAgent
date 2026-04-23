"""
Base Agent
Common foundation for all specialist agents.
Provides Claude client, event helpers, and MCP tool runner.
"""

from __future__ import annotations
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import anthropic
from a2a.protocol import TaskRequest, TaskResult, TaskStatus
from a2a.task_manager import task_manager
from config.settings import ANTHROPIC_API_KEY, MODEL_NAME


class BaseAgent:
    def __init__(self, name: str):
        self.name   = name
        self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        self.model  = MODEL_NAME

    # ── Entry point ───────────────────────────────────────────────────────────

    async def run(self, request: TaskRequest) -> TaskResult:
        """Override in each agent."""
        raise NotImplementedError

    # ── Event helpers ─────────────────────────────────────────────────────────

    async def emit_status(self, job_id: str, status: TaskStatus, task: str = "") -> None:
        await task_manager.emit_agent_status(job_id, self.name, status, task)

    async def emit_log(self, job_id: str, message: str) -> None:
        await task_manager.emit_log(job_id, self.name, message)

    async def emit_mcp(self, job_id: str, tool: str, inp: str = "", out: str = "") -> None:
        await task_manager.emit_mcp_call(job_id, self.name, tool, inp, out)

    # ── Claude helper ─────────────────────────────────────────────────────────

    def _ask_claude_sync(self, system: str, user: str, max_tokens: int = 4096) -> str:
        """Blocking Claude call — always call via ask_claude() not directly."""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return response.content[0].text.strip()

    async def ask_claude(self, system: str, user: str, max_tokens: int = 4096) -> str:
        """Non-blocking Claude call — runs in thread pool so event loop stays free."""
        return await asyncio.to_thread(self._ask_claude_sync, system, user, max_tokens)

    # ── Result helpers ────────────────────────────────────────────────────────

    def ok(self, request: TaskRequest, output: str) -> TaskResult:
        return TaskResult(
            task_id    = request.task_id,
            job_id     = request.job_id,
            from_agent = self.name,
            status     = TaskStatus.COMPLETED,
            output     = output,
        )

    def fail(self, request: TaskRequest, error: str) -> TaskResult:
        return TaskResult(
            task_id    = request.task_id,
            job_id     = request.job_id,
            from_agent = self.name,
            status     = TaskStatus.FAILED,
            error      = error,
        )
