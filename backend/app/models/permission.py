import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, String, DateTime, func
from sqlalchemy.orm import mapped_column, Mapped

from app.core.database import Base


class DeptPermission(Base):
    __tablename__ = "sys_dept_permissions"

    perm_id: Mapped[uuid.UUID]   = mapped_column(primary_key=True, default=uuid.uuid4)
    dept_id: Mapped[uuid.UUID]   = mapped_column(ForeignKey("sys_departments.dept_id"), nullable=False, index=True)
    sub_menu_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sys_sub_menus.sub_menu_id"), nullable=False, index=True)
    can_search: Mapped[bool]     = mapped_column(Boolean, default=False)
    can_create: Mapped[bool]     = mapped_column(Boolean, default=False)
    can_update: Mapped[bool]     = mapped_column(Boolean, default=False)
    can_delete: Mapped[bool]     = mapped_column(Boolean, default=False)
    can_print: Mapped[bool]      = mapped_column(Boolean, default=False)
    can_export: Mapped[bool]     = mapped_column(Boolean, default=False)
    granted_by: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserPermission(Base):
    __tablename__ = "sys_user_permissions"

    perm_id: Mapped[uuid.UUID]   = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID]   = mapped_column(ForeignKey("sys_users.user_id"), nullable=False, index=True)
    sub_menu_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sys_sub_menus.sub_menu_id"), nullable=False, index=True)
    can_search: Mapped[bool]     = mapped_column(Boolean, default=False)
    can_create: Mapped[bool]     = mapped_column(Boolean, default=False)
    can_update: Mapped[bool]     = mapped_column(Boolean, default=False)
    can_delete: Mapped[bool]     = mapped_column(Boolean, default=False)
    can_print: Mapped[bool]      = mapped_column(Boolean, default=False)
    can_export: Mapped[bool]     = mapped_column(Boolean, default=False)
    override_type: Mapped[str]   = mapped_column(String(20), default="EXPLICIT")
    granted_by: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
