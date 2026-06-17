from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    verify_password, generate_session_token,
    generate_csrf_token, hash_token, session_expires_at,
)
from app.core.config import settings
from app.models.user import User
from app.models.session import Session
from app.models.audit import AuditLog
from app.schemas.auth import LoginRequest

router = APIRouter()


@router.post("/login")
async def login(
    request: Request,
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    async def audit_fail(reason: str):
        db.add(AuditLog(
            action_type="LOGIN_FAIL",
            ip_address=request.client.host if request.client else None,
            result="FAILURE",
            failure_reason=reason,
        ))

    if not user or not user.is_active:
        await audit_fail("User not found or inactive")
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    now = datetime.now(timezone.utc)
    if user.locked_until and user.locked_until.replace(tzinfo=timezone.utc) > now:
        raise HTTPException(status_code=423, detail="계정이 잠겨있습니다. 잠시 후 다시 시도하세요.")

    if not verify_password(body.password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.max_login_attempts:
            user.locked_until = now + timedelta(minutes=settings.lockout_minutes)
        await audit_fail("Wrong password")
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

    user.failed_login_attempts = 0
    user.locked_until = None

    raw_token, token_hash = generate_session_token()
    csrf_token = generate_csrf_token()

    db.add(Session(
        user_id=user.user_id,
        session_token_hash=token_hash,
        csrf_token_hash=hash_token(csrf_token),
        ip_address=request.client.host if request.client else None,
        created_at=now,
        expires_at=session_expires_at(),
        last_activity_at=now,
    ))
    db.add(AuditLog(
        action_type="LOGIN_SUCCESS",
        user_id=user.user_id,
        ip_address=request.client.host if request.client else None,
        result="SUCCESS",
    ))

    response.set_cookie(
        "session_token", raw_token,
        httponly=True,
        secure=False,       # Set True when HTTPS is enabled
        samesite="strict",
        max_age=settings.session_expire_hours * 3600,
    )

    dept_name = user.department.dept_name if user.department else ""
    return {
        "user": {
            "id": str(user.user_id),
            "username": user.username,
            "displayName": user.display_name,
            "deptName": dept_name,
            "isSystemAdmin": user.is_system_admin,
        },
        "csrfToken": csrf_token,
        "permissions": {},   # TODO: resolve from DB per sub_menu
    }


@router.post("/logout")
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("session_token")
    if token:
        result = await db.execute(
            select(Session).where(Session.session_token_hash == hash_token(token))
        )
        session = result.scalar_one_or_none()
        if session:
            session.is_revoked = True
    response.delete_cookie("session_token")
    return {"message": "로그아웃되었습니다."}
