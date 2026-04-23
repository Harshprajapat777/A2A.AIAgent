"""
A2A Protocol — Data Models
Defines every message type that flows between agents and to the frontend.
"""

from __future__ import annotations
from enum import Enum
from typing import Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
import uuid


# ── Enums ─────────────────────────────────────────────────────────────────────

class TaskStatus(str, Enum):
    SUBMITTED  = "submitted"
    WORKING    = "working"
    COMPLETED  = "completed"
    FAILED     = "failed"


class AgentName(str, Enum):
    ORCHESTRATOR = "Orchestrator"
    SEARCH       = "SearchAgent"
    ANALYST      = "AnalystAgent"
    WRITER       = "WriterAgent"


# ── Agent Card (A2A standard — served at /.well-known/agent.json) ─────────────

class AgentCard(BaseModel):
    name:         str
    description:  str
    url:          str
    version:      str          = "1.0"
    capabilities: list[str]   = []


# ── Task messages (Orchestrator ↔ Specialist agents) ─────────────────────────

class TaskRequest(BaseModel):
    """Orchestrator → Specialist Agent"""
    task_id:    str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id:     str                   # parent research job
    from_agent: str
    to_agent:   str
    input:      str                   # the actual instruction/data
    context:    dict[str, Any] = {}   # optional extra context


class TaskResult(BaseModel):
    """Specialist Agent → Orchestrator"""
    task_id:    str
    job_id:     str
    from_agent: str
    status:     TaskStatus
    output:     str = ""
    error:      str = ""


# ── WebSocket Events (Backend → Frontend) ────────────────────────────────────
# Every action in the pipeline emits one of these 5 event types.

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class AgentStatusEvent(BaseModel):
    """Agent changed state — updates PipelineView"""
    type:      str         = "agent_status"
    timestamp: str         = Field(default_factory=_now)
    agent:     str
    status:    TaskStatus
    task:      str         = ""        # short description of current task


class A2ACallEvent(BaseModel):
    """Agent-to-agent message — updates A2ACallLog + animates arrow"""
    type:      str         = "a2a_call"
    timestamp: str         = Field(default_factory=_now)
    from_agent: str
    to_agent:   str
    payload:    str        = ""        # short description of what was sent
    status:     TaskStatus = TaskStatus.SUBMITTED


class MCPCallEvent(BaseModel):
    """Agent called an MCP tool — updates MCPCallLog"""
    type:      str  = "mcp_call"
    timestamp: str  = Field(default_factory=_now)
    agent:     str
    tool:      str
    input:     str  = ""
    output:    str  = ""


class LogEvent(BaseModel):
    """Plain log line — updates ActivityLog"""
    type:      str  = "log"
    timestamp: str  = Field(default_factory=_now)
    agent:     str
    message:   str


class DoneEvent(BaseModel):
    """Pipeline finished — triggers ReportViewer"""
    type:        str  = "done"
    timestamp:   str  = Field(default_factory=_now)
    job_id:      str
    report_id:   str
    report_file: str  # filename inside reports/


# Union type for type hints
WSEvent = AgentStatusEvent | A2ACallEvent | MCPCallEvent | LogEvent | DoneEvent
