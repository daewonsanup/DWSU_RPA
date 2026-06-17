import uuid
from datetime import datetime
from typing import Optional, Any
from sqlalchemy import String, DateTime, func, BigInteger, JSON
from sqlalchemy.orm import mapped_column, Mapped

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "sys_audit_logs"

    log_id: Mapped[int]                    = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[uuid.UUID]]   = mapped_column(nullable=True)
    session_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    sub_menu_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    action_type: Mapped[str]               = mapped_column(String(50), nullable=False)
    target_table: Mapped[Optional[str]]    = mapped_column(String(100), nullable=True)
    target_record_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    old_values: Mapped[Optional[Any]]      = mapped_column(JSON, nullable=True)
    new_values: Mapped[Optional[Any]]      = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]]      = mapped_column(String(45), nullable=True)
    result: Mapped[str]                    = mapped_column(String(20), nullable=False, default="SUCCESS")
    failure_reason: Mapped[Optional[str]]  = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime]           = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
