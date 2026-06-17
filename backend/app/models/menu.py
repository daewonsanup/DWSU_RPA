import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.core.database import Base


class MainMenu(Base):
    __tablename__ = "sys_main_menus"

    menu_id: Mapped[uuid.UUID]   = mapped_column(primary_key=True, default=uuid.uuid4)
    menu_code: Mapped[str]       = mapped_column(String(20), unique=True, nullable=False)
    menu_name: Mapped[str]       = mapped_column(String(100), nullable=False)
    menu_icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sort_order: Mapped[int]      = mapped_column(Integer, default=0)
    is_active: Mapped[bool]      = mapped_column(Boolean, default=True)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    sub_menus: Mapped[list["SubMenu"]] = relationship(
        "SubMenu", back_populates="main_menu", order_by="SubMenu.sort_order"
    )


class SubMenu(Base):
    __tablename__ = "sys_sub_menus"

    sub_menu_id: Mapped[uuid.UUID]  = mapped_column(primary_key=True, default=uuid.uuid4)
    menu_id: Mapped[uuid.UUID]       = mapped_column(ForeignKey("sys_main_menus.menu_id"), nullable=False)
    sub_menu_code: Mapped[str]       = mapped_column(String(20), unique=True, nullable=False)
    sub_menu_name: Mapped[str]       = mapped_column(String(100), nullable=False)
    route_path: Mapped[str]          = mapped_column(String(200), nullable=False)
    component_name: Mapped[str]      = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int]          = mapped_column(Integer, default=0)
    is_active: Mapped[bool]          = mapped_column(Boolean, default=True)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)
    created_at: Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    main_menu: Mapped[MainMenu] = relationship("MainMenu", back_populates="sub_menus")
