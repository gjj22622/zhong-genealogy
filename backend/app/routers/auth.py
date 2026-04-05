from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserInfo
from app.services.auth import register_user, authenticate_user, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["認證"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # 驗證家族註冊碼
    if req.family_code != settings.FAMILY_CODE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="註冊碼無效")

    # 檢查 email 是否已存在
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="此 email 已註冊")

    user = register_user(db, req.email, req.password, req.display_name)
    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        user=UserInfo.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="帳號或密碼錯誤")

    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        user=UserInfo.model_validate(user),
    )


@router.get("/me", response_model=UserInfo)
def get_me(user: User = Depends(get_current_user)):
    return UserInfo.model_validate(user)
