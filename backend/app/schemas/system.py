from pydantic import BaseModel, field_validator

FORBIDDEN_PORTS = frozenset({80, 443, 22, 21, 25, 3000, 3306, 1433, 1521, 8000, 8080})
FORBIDDEN_DB_PORTS = frozenset({5432, 3306, 1433, 1521, 80, 443, 22, 25, 21})


class DbTestRequest(BaseModel):
    host: str
    port: int
    db_name: str
    db_user: str
    db_password: str

    @field_validator("port")
    @classmethod
    def check_db_port(cls, v: int) -> int:
        if not (1024 <= v <= 65535):
            raise ValueError("포트는 1024~65535 범위여야 합니다.")
        if v in FORBIDDEN_DB_PORTS:
            raise ValueError(f"{v}번은 표준 DB 포트입니다. 비표준 포트를 사용하세요.")
        return v


class ConfigureRequest(BaseModel):
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str
    web_port: int

    @field_validator("db_port")
    @classmethod
    def check_db_port(cls, v: int) -> int:
        if v in FORBIDDEN_DB_PORTS:
            raise ValueError(f"DB 포트 {v}는 허용되지 않습니다.")
        return v

    @field_validator("web_port")
    @classmethod
    def check_web_port(cls, v: int) -> int:
        if not (1024 <= v <= 65535):
            raise ValueError("웹 포트는 1024~65535 범위여야 합니다.")
        if v in FORBIDDEN_PORTS:
            raise ValueError(f"웹 포트 {v}는 허용되지 않습니다. 비표준 포트를 사용하세요.")
        return v
