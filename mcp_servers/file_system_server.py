"""
MCP Server — File System
Exposes tools: write_file(path, content), read_file(path), list_reports()
All paths are scoped to the reports/ directory for safety.
Agents connect to this via stdio transport.
"""

import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.server.fastmcp import FastMCP
from config.settings import REPORTS_DIR

mcp = FastMCP("file-system-server")

# Ensure reports dir exists
os.makedirs(REPORTS_DIR, exist_ok=True)


def _safe_path(filename: str) -> str:
    """Resolve path and ensure it stays inside REPORTS_DIR."""
    # Strip any directory traversal attempts
    filename = os.path.basename(filename)
    return os.path.join(REPORTS_DIR, filename)


@mcp.tool()
def write_file(filename: str, content: str) -> str:
    """
    Write content to a file inside the reports/ directory.

    Args:
        filename: File name only (e.g. 'report.md'). No path traversal allowed.
        content:  Full text content to write.

    Returns:
        Absolute path of the written file.
    """
    try:
        path = _safe_path(filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return path
    except Exception as e:
        return f"ERROR: {e}"


@mcp.tool()
def read_file(filename: str) -> str:
    """
    Read content from a file inside the reports/ directory.

    Args:
        filename: File name only (e.g. 'report.md').

    Returns:
        File content as a string, or an error message.
    """
    try:
        path = _safe_path(filename)
        if not os.path.exists(path):
            return f"ERROR: File not found: {filename}"
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"ERROR: {e}"


@mcp.tool()
def list_reports() -> str:
    """
    List all report files in the reports/ directory.

    Returns:
        Newline-separated list of filenames with their sizes and dates.
    """
    try:
        files = []
        for fname in sorted(os.listdir(REPORTS_DIR)):
            if fname.startswith("."):
                continue
            fpath = os.path.join(REPORTS_DIR, fname)
            stat  = os.stat(fpath)
            size  = stat.st_size
            mtime = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M")
            files.append(f"{fname}  ({size} bytes)  {mtime}")
        return "\n".join(files) if files else "No reports yet."
    except Exception as e:
        return f"ERROR: {e}"


if __name__ == "__main__":
    mcp.run(transport="stdio")
