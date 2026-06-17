from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import hash_password, is_forbidden_username
from app.models.user import User, Department, ForbiddenUsername
from app.schemas.auth import InitRequest

router = APIRouter()

FORBIDDEN_SEED = [
    "admin", "root", "administrator", "superuser", "sysadmin",
    "sa", "dba", "test", "guest", "user", "manager", "system",
    "ops", "operator", "service", "daemon",
]


@router.get("/status")
async def status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.is_system_admin.is_(True)))
    initialized = result.scalar_one_or_none() is not None
    return {"initialized": initialized}


@router.post("/initialize")
async def initialize(body: InitRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.is_system_admin.is_(True)))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="이미 초기화된 시스템입니다.")

    if is_forbidden_username(body.admin_username):
        raise HTTPException(
            status_code=400,
            detail=f"'{body.admin_username}'은(는) 사용 불가능한 아이디입니다. 기본 계정명은 사용할 수 없습니다.",
        )

    if body.password != body.confirm_password:
        raise HTTPException(status_code=400, detail="비밀번호가 일치하지 않습니다.")

    for name in FORBIDDEN_SEED:
        db.add(ForbiddenUsername(username=name))

    dept = Department(dept_code="SYS", dept_name="시스템관리")
    db.add(dept)
    await db.flush()

    db.add(User(
        username=body.admin_username,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
        dept_id=dept.dept_id,
        is_system_admin=True,
        is_active=True,
    ))

    return {"message": "시스템 초기화가 완료되었습니다."}


@router.get("/menus")
async def list_menus(db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    from app.models.menu import MainMenu
    result = await db.execute(
        select(MainMenu)
        .where(MainMenu.is_active.is_(True))
        .options(selectinload(MainMenu.sub_menus))
        .order_by(MainMenu.sort_order)
    )
    menus = result.scalars().all()
    return [
        {
            "id": str(m.menu_id),
            "code": m.menu_code,
            "name": m.menu_name,
            "icon": m.menu_icon,
            "subMenus": [
                {
                    "id": str(s.sub_menu_id),
                    "code": s.sub_menu_code,
                    "name": s.sub_menu_name,
                    "routePath": s.route_path,
                }
                for s in m.sub_menus if s.is_active
            ],
        }
        for m in menus
    ]
