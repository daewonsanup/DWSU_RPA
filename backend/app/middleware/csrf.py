from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


CSRF_EXEMPT = {
    "/api/auth/login",
    "/api/system/status",
    "/api/system/test-db",
    "/api/system/configure",
    "/api/system/initialize",
}
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in SAFE_METHODS or request.url.path in CSRF_EXEMPT:
            return await call_next(request)

        token = request.headers.get("X-CSRF-Token")
        if not token:
            return JSONResponse({"detail": "CSRF 토큰이 없습니다."}, status_code=403)

        return await call_next(request)
