"""
Research Routes
POST /research     — start a new research job
GET  /jobs         — list all jobs
GET  /jobs/{id}    — get one job status
"""

import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException

from api.models import ResearchRequest, JobResponse, JobStatusResponse
from a2a.task_manager import task_manager
from agents.orchestrator import orchestrator

router = APIRouter()


async def _run_pipeline(job_id: str, topic: str) -> None:
    """Background task — runs full agent pipeline for a job."""
    try:
        await orchestrator.run_job(job_id, topic)
    except Exception as e:
        # Errors are already handled inside orchestrator.run_job
        # (it emits error events + marks job failed)
        pass


@router.post("/research", response_model=JobResponse, status_code=202)
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """
    Start a new research job.
    Returns job_id immediately — connect to WS /ws/stream/{job_id} for live events.
    """
    job_id = task_manager.create_job(request.topic)
    background_tasks.add_task(_run_pipeline, job_id, request.topic)

    return JobResponse(
        job_id  = job_id,
        topic   = request.topic,
        status  = "submitted",
        message = f"Job started. Stream events at /ws/stream/{job_id}",
    )


@router.get("/jobs", response_model=list[JobStatusResponse])
async def list_jobs():
    """List all research jobs (most recent first)."""
    return [JobStatusResponse(**j) for j in task_manager.all_jobs()]


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job(job_id: str):
    """Get status of a specific job."""
    job = task_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
    return JobStatusResponse(**job.to_dict())
