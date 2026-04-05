from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionOut
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/submissions", tags=["提交審核"])


@router.post("", response_model=SubmissionOut)
def create_submission(
    req: SubmissionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.type not in ("add", "edit"):
        raise HTTPException(status_code=400, detail="type 必須為 add 或 edit")
    if req.type == "edit" and not req.target_person_id:
        raise HTTPException(status_code=400, detail="修改類型需指定 target_person_id")

    submission = Submission(
        user_id=user.id,
        type=req.type,
        target_person_id=req.target_person_id,
        data=req.data,
        status="pending",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/mine", response_model=list[SubmissionOut])
def get_my_submissions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Submission)
        .filter(Submission.user_id == user.id)
        .order_by(Submission.created_at.desc())
        .all()
    )
