from pydantic import BaseModel


class RegisterRequest(BaseModel):
    username: str
    password: str
    display_name: str
    phone: str | None = None
    email: str | None = None
    line_id: str | None = None
    relation_claim: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: "UserInfo"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserInfo(BaseModel):
    id: int
    username: str
    display_name: str
    role: str
    status: str

    model_config = {"from_attributes": True}
