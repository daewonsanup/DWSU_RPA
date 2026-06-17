import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.session import Session


class Department(Base):
    __tablename__ = "sys_departments"

    dept_id: Mapped[uuid.UUID]  = mapped_column(primary_key=True, default=uuid.uuid4)
    dept_code: Mapped[str]      = mapped_column(String(20), unique=True, nullable=False)
    dept_name: Mapped[str]      = mapped_column(String(100), nullable=False)
    parent_dept_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("sys_departments.dept_id"), nullable=True
    )
    sort_order: Mapped[int]     = mapped_column(Integer, default=0)
    is_active: Mapped[bool]     = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    users: Mapped[list["User"]] = relationship("User", back_populates="department")


class User(Base):
    __tablename__ = "sys_users"

    user_id: Mapped[uuid.UUID]       = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str]             = mapped_column(String(50), unique=True, nullable=False, index=True)
    password_hash: Mapped[str]        = mapped_column(String(72), nullable=False)
    display_name: Mapped[str]         = mapped_column(String(100), nullable=False)
    dept_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("sys_departments.dept_id"), nullable=True)
    email: Mapped[Optional[str]]      = mapped_column(String(255), unique=True, nullable=True)
    is_active: Mapped[bool]           = mapped_column(Boolean, default=True)
    is_system_admin: Mapped[bool]     = mapped_column(Boolean, default=False)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    password_changed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    created_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    department: Mapped[Optional[Department]] = relationship("Department", back_populates="users")
    sessions: Mapped[list["Session"]]        = relationship("Session", back_populates="user")


class ForbiddenUsername(Base):
    __tablename__ = "sys_forbidden_usernames"
    username: Mapped[str] = mapped_column(String(50), primary_key=True)
