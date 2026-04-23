"""
WebSocket — Live event stream
WS /ws/stream/{job_id}

Frontend connects here right after POST /research.
Receives a stream of JSON events from the task_manager until the job completes.
Event types: agent_status | a2a_call | mcp_call | log | done
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException

from a2a.task_manager import task_manager

router = APIRouter()


@router.websocket("/ws/stream/{job_id}")
async def stream_events(websocket: WebSocket, job_id: str):
    """
    Stream all events for a job to the connected WebSocket client.
    - Replays any events that arrived before the client connected
    - Then streams live events as they happen
    - Closes when the job is done (done / error sentinel)
    """
    job = task_manager.get_job(job_id)
    if not job:
        await websocket.close(code=4004, reason=f"Job '{job_id}' not found")
        return

    await websocket.accept()

    try:
        async for event in task_manager.subscribe(job_id):
            await websocket.send_json(event)

            # Stop streaming once pipeline is done or failed
            if event.get("type") in ("done",):
                break

    except WebSocketDisconnect:
        # Client closed the tab — that's fine
        pass
    except Exception as e:
        try:
            await websocket.send_json({
                "type":    "log",
                "agent":   "System",
                "message": f"Stream error: {e}"
            })
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
