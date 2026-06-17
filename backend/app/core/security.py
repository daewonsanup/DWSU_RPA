import secrets
import hashlib
import bcrypt
from datetime import datetime, timedelta, timezone

from app.core.config import settings

FORBIDDEN_USERNAMES = frozenset({
    "admin", "root", "administrator", "superuser", "sysadmin",
    "sa", "dba", "test", "guest", "user", "manager", "system",
    "ops", "operator", "service", "daemon",
})


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(
        plain.encode(), bcrypt.gensalt(rounds=settings.bcrypt_rounds)
    ).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def generate_session_token() -> tuple[str, str]:
    """Returns (raw_token, sha256_hash). Store only the hash."""
    raw = secrets.token_urlsafe(48)
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    return raw, hashed


def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def session_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(hours=settings.session_expire_hours)


def is_forbidden_username(username: str) -> bool:
    return username.lower() in FORBIDDEN_USERNAMES
