from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog
from uuid import UUID
from typing import Any, Dict

async def log_action(
    db: AsyncSession,
    actor_id: UUID,
    action: str,
    target_type: str,
    target_id: UUID,
    details: Dict[str, Any]
):
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details
    )
    db.add(log)
    await db.commit()
