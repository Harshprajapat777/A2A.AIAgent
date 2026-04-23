"""
Reports Routes
GET /reports           — list all saved reports
GET /reports/{filename} — get a report's full content
"""

import os
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from api.models import ReportMeta, ReportDetail
from config.settings import REPORTS_DIR

router = APIRouter()


@router.get("/reports", response_model=list[ReportMeta])
async def list_reports():
    """List all generated reports, newest first."""
    reports = []
    try:
        for fname in os.listdir(REPORTS_DIR):
            if not fname.endswith(".md"):
                continue
            fpath = os.path.join(REPORTS_DIR, fname)
            stat  = os.stat(fpath)
            reports.append(ReportMeta(
                filename   = fname,
                size       = stat.st_size,
                created_at = datetime.fromtimestamp(stat.st_mtime).isoformat(),
            ))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Sort newest first
    reports.sort(key=lambda r: r.created_at, reverse=True)
    return reports


@router.get("/reports/{filename}", response_model=ReportDetail)
async def get_report(filename: str):
    """Get the full content of a specific report."""
    # Safety: strip path traversal
    filename = os.path.basename(filename)
    fpath    = os.path.join(REPORTS_DIR, filename)

    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Report '{filename}' not found")

    try:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        stat = os.stat(fpath)
        return ReportDetail(
            filename = filename,
            content  = content,
            size     = stat.st_size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/{filename}/raw", response_class=PlainTextResponse)
async def get_report_raw(filename: str):
    """Get raw markdown content (plain text)."""
    filename = os.path.basename(filename)
    fpath    = os.path.join(REPORTS_DIR, filename)

    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Report '{filename}' not found")

    with open(fpath, "r", encoding="utf-8") as f:
        return f.read()
