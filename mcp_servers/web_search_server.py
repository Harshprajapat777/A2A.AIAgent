"""
MCP Server — Web Search
Exposes a single tool: search(query, max_results)
Agents connect to this via stdio transport.
"""

import asyncio
import json
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.server.fastmcp import FastMCP
from tavily import TavilyClient
from config.settings import TAVILY_API_KEY

mcp = FastMCP("web-search-server")
tavily = TavilyClient(api_key=TAVILY_API_KEY)


@mcp.tool()
def search(query: str, max_results: int = 8) -> str:
    """
    Search the web for a given query using Tavily.
    Returns a JSON string with title, url, and content for each result.

    Args:
        query: The search query string
        max_results: Number of results to return (default 8)
    """
    try:
        response = tavily.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",
            include_answer=True,
        )

        results = []

        # Include Tavily's synthesized answer if present
        if response.get("answer"):
            results.append({
                "type": "answer",
                "content": response["answer"]
            })

        # Include individual source results
        for r in response.get("results", []):
            results.append({
                "type": "source",
                "title":   r.get("title", ""),
                "url":     r.get("url", ""),
                "content": r.get("content", ""),
                "score":   r.get("score", 0),
            })

        return json.dumps(results, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps({"error": str(e)})


if __name__ == "__main__":
    mcp.run(transport="stdio")
