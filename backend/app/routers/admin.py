"""Admin-only endpoints: cache revalidation + import triggers.

Guard: `X-Admin-Token` header must equal ADMIN_API_TOKEN.
The Sanity publish webhook can hit /api/admin/revalidate with the same header.
"""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends

from app.deps import require_admin
from app.importers import hhc
from app.services.cache import bust

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/revalidate")
async def revalidate(prefix: str | None = None):
    cleared = bust(prefix)
    return {"cleared": cleared, "prefix": prefix or "*"}


@router.post("/import/hhc")
async def import_hhc(background: BackgroundTasks, dry_run: bool = False, limit: int | None = None):
    """Kick off an HHC wholesaler sync. Runs in the background; returns a job id."""
    job_id = hhc.new_job()
    background.add_task(hhc.run_sync, job_id, dry_run=dry_run, limit=limit)
    return {"jobId": job_id, "status": "started", "dryRun": dry_run}


@router.get("/import/hhc/{job_id}")
async def import_status(job_id: str):
    return hhc.job_status(job_id)
