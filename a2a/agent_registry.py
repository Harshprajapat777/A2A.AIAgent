"""
A2A Agent Registry
Central map of all agents — name → URL + metadata.
Orchestrator uses this to know where to send tasks.
Each agent registers itself on startup.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from a2a.protocol import AgentCard
from config.settings import (
    SEARCH_AGENT_URL,
    ANALYST_AGENT_URL,
    WRITER_AGENT_URL,
    ORCHESTRATOR_URL,
)


@dataclass
class AgentInfo:
    name:         str
    url:          str
    description:  str
    capabilities: list[str]
    port:         int

    def to_card(self) -> AgentCard:
        return AgentCard(
            name=self.name,
            description=self.description,
            url=self.url,
            capabilities=self.capabilities,
        )


# ── Registry ──────────────────────────────────────────────────────────────────

class AgentRegistry:
    """
    Singleton registry. Agents are pre-registered here so the
    orchestrator always knows who's available without discovery calls.
    """

    _agents: dict[str, AgentInfo] = {}

    @classmethod
    def register(cls, info: AgentInfo) -> None:
        cls._agents[info.name] = info

    @classmethod
    def get(cls, name: str) -> AgentInfo:
        if name not in cls._agents:
            raise KeyError(f"Agent '{name}' not found in registry. Registered: {list(cls._agents)}")
        return cls._agents[name]

    @classmethod
    def get_url(cls, name: str) -> str:
        return cls.get(name).url

    @classmethod
    def all_agents(cls) -> list[AgentInfo]:
        return list(cls._agents.values())

    @classmethod
    def all_cards(cls) -> list[dict]:
        return [a.to_card().model_dump() for a in cls._agents.values()]


# ── Pre-register all agents ───────────────────────────────────────────────────
# Called once at import time so every module sees a fully-populated registry.

AgentRegistry.register(AgentInfo(
    name         = "Orchestrator",
    url          = ORCHESTRATOR_URL,
    port         = 8013,
    description  = "Manager agent. Receives a research topic, breaks it into tasks, delegates to specialist agents via A2A, and compiles the final result.",
    capabilities = ["orchestrate", "delegate", "plan"],
))

AgentRegistry.register(AgentInfo(
    name         = "SearchAgent",
    url          = SEARCH_AGENT_URL,
    port         = 8010,
    description  = "Searches the web using the Tavily MCP tool. Returns raw search results for a given query.",
    capabilities = ["web_search"],
))

AgentRegistry.register(AgentInfo(
    name         = "AnalystAgent",
    url          = ANALYST_AGENT_URL,
    port         = 8011,
    description  = "Analyzes raw search data using Claude. Extracts key insights, removes noise, and returns structured facts.",
    capabilities = ["analyze", "summarize", "extract_insights"],
))

AgentRegistry.register(AgentInfo(
    name         = "WriterAgent",
    url          = WRITER_AGENT_URL,
    port         = 8012,
    description  = "Writes a full structured markdown report from analyst insights. Saves it to the file system via MCP.",
    capabilities = ["write_report", "save_file"],
))
