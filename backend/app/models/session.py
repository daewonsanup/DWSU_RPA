import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Session(Base):
    __tablename__ = "sys_sessions"

    session_id: Mapped[uuid.UUID]       = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID]          = mapped_column(ForeignKey("sys_users.user_id"), nullable=False, index=True)
    session_token_hash: Mapped[str]     = mapped_column(String(64), unique=True, nullable=False)
    csrf_token_hash: Mapped[str]        = mapped_column(String(64), nullable=False)
    ip_address: Mapped[Optional[str]]   = mapped_column(String(45), nullable=True)
    user_agent_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    is_revoked: Mapped[bool]            = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime]        = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime]        = mapped_column(DateTime(timezone=True), nullable=False)
    last_activity_at: Mapped[datetime]  = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="sessions")
