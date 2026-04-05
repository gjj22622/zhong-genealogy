from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, UserInfo
from app.services.auth import (
    register_user, authenticate_user,
    create_access_token, create_refresh_token, decode_token,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["認證"])


@router.post("/register", response_model=dict)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="密碼至少需 6 個字元")

    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="此帳號已被使用")

    user = register_user(
        db,
        username=req.username,
        password=req.password,
        display_name=req.display_name,
        phone=req.phone,
        email=req.email,
        line_id=req.line_id,
        relation_claim=req.relation_claim,
    )
    return {"message": "註冊成功，等待管理員審核", "user_id": user.id}


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="帳號或密碼錯誤")

    if user.status == "pending":
        raise HTTPException(status_code=403, detail="您的帳號正在等待管理員審核")
    if user.status == "suspended":
        raise HTTPException(status_code=403, detail="您的帳號已被停用")
    if user.status == "rejected":
        raise HTTPException(status_code=403, detail="您的帳號申請已被退回")

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        user=UserInfo.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)):
    user_id = decode_token(req.refresh_token, expected_type="refresh")
    if not user_id:
        raise HTTPException(status_code=401, detail="Refresh token 無效或已過期")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.status != "active":
        raise HTTPException(status_code=401, detail="帳號不存在或已停用")

    access = create_access_token(user.id)
    return TokenResponse(
        access_token=access,
        user=UserInfo.model_validate(user),
    )


@router.get("/me", response_model=UserInfo)
def get_me(user: User = Depends(get_current_user)):
    return UserInfo.model_validate(user)


@router.put("/me", response_model=UserInfo)
def update_me(
    phone: str | None = None,
    email: str | None = None,
    line_id: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if phone is not None:
        user.phone = phone
    if email is not None:
        user.email = email
    if line_id is not None:
        user.line_id = line_id
    db.commit()
    db.refresh(user)
    return UserInfo.model_validate(user)
