import re
from pydantic import BaseModel, field_validator


class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def sanitize_username(cls, v: str) -> str:
        if not re.match(r'^[a-zA-Z0-9_.\-]{3,50}$', v):
            raise ValueError("유효하지 않은 아이디 형식입니다.")
        return v.lower()


class InitRequest(BaseModel):
    admin_username: str
    password: str
    confirm_password: str
    display_name: str

    @field_validator("admin_username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r'^[a-zA-Z0-9_.\-]{4,50}$', v):
            raise ValueError("아이디는 4~50자 영문·숫자·_·.·- 만 사용 가능합니다.")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("비밀번호는 최소 12자 이상이어야 합니다.")
        if not re.search(r'[A-Z]', v):
            raise ValueError("비밀번호에 대문자가 포함되어야 합니다.")
        if not re.search(r'[0-9]', v):
            raise ValueError("비밀번호에 숫자가 포함되어야 합니다.")
        if not re.search(r'[!@#$%^&*()\-_=+\[\]{};:\'",.<>/?\\|`~]', v):
            raise ValueError("비밀번호에 특수문자가 포함되어야 합니다.")
        return v
