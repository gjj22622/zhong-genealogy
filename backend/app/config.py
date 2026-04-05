import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/chung_family"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 天
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    FAMILY_CODE: str = os.getenv("FAMILY_CODE", "")


settings = Settings()
