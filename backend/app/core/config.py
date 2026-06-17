from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    secret_key: str = "CHANGE_THIS"
    app_port: int = 8080

    db_host: str = "localhost"
    db_port: int = 15432
    db_name: str = "dwsu_erp"
    db_user: str = "erp_app"
    db_password: str = "CHANGE_THIS"

    session_expire_hours: int = 4
    bcrypt_rounds: int = 12
    max_login_attempts: int = 5
    lockout_minutes: int = 15

    allowed_origins: list[str] = ["http://localhost:8585"]

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
