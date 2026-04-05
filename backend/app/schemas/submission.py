from pydantic import BaseModel
from datetime import datetime


class SubmissionCreate(BaseModel):
    type: str  # "add" or "edit"
    target_person_id: int | None = None
    data: dict


class SubmissionOut(BaseModel):
    id: int
    user_id: int
    type: str
    target_person_id: int | None
    data: dict
    status: str
    admin_notes: str | None
    created_at: datetime
    reviewed_at: datetime | None

    model_config = {"from_attributes": True}


class SubmissionReview(BaseModel):
    action: str  # "approve" or "reject"
    admin_notes: str | None = None
    modified_data: dict | None = None  # 管理員修改後的資料（修改後通過）
