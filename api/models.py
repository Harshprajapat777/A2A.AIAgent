"""
API Models — Pydantic schemas for all request/response bodies.
"""

from pydantic import BaseModel, Field
from typing import Optional


class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=500, description="Research topic")


class JobResponse(BaseModel):
    job_id:     str
    topic:      str
    status:     str
    message:    str = ""


class JobStatusResponse(BaseModel):
    job_id:      str
    topic:       str
    status:      str
    report_id:   str = ""
    report_file: str = ""
    created_at:  str = ""
    event_count: int = 0


class ReportMeta(BaseModel):
    filename:   str
    size:       int
    created_at: str


class ReportDetail(BaseModel):
    filename:   str
    content:    str
    size:       int
