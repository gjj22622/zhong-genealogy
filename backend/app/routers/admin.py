from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.person import Person
from app.models.submission import Submission
from app.schemas.submission import SubmissionOut, SubmissionReview
from app.schemas.auth import UserInfo
from app.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["管理員"])


# ============ SUBMISSIONS ============

@router.get("/submissions", response_model=list[SubmissionOut])
def list_submissions(
    status: str | None = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Submission)
    if status:
        q = q.filter(Submission.status == status)
    return q.order_by(Submission.created_at.desc()).all()


@router.put("/submissions/{submission_id}", response_model=SubmissionOut)
def review_submission(
    submission_id: int,
    review: SubmissionReview,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="提交不存在")
    if sub.status != "pending":
        raise HTTPException(status_code=400, detail="此提交已被審核")

    now = datetime.now(timezone.utc)

    if review.action == "reject":
        sub.status = "rejected"
        sub.admin_notes = review.admin_notes
        sub.reviewed_by = admin.id
        sub.reviewed_at = now
        db.commit()
        db.refresh(sub)
        return sub

    if review.action == "approve":
        final_data = review.modified_data if review.modified_data else sub.data
        sub.status = "approved"
        sub.admin_notes = review.admin_notes
        sub.reviewed_by = admin.id
        sub.reviewed_at = now
        if review.modified_data:
            sub.data = review.modified_data

        if sub.type == "add":
            person = Person(
                name=final_data.get("name", ""),
                gender=final_data.get("gender", "male"),
                generation=final_data.get("generation"),
                branch=final_data.get("branch"),
                birth_year=str(final_data["birthYear"]) if final_data.get("birthYear") else None,
                death_year=str(final_data["deathYear"]) if final_data.get("deathYear") else None,
                spouse=final_data.get("spouse"),
                bio=final_data.get("notes", ""),
                father_id=final_data.get("parentId"),
            )
            db.add(person)
            db.flush()

        elif sub.type == "edit" and sub.target_person_id:
            person = db.query(Person).filter(Person.id == sub.target_person_id).first()
            if person:
                for key, value in final_data.items():
                    field_map = {
                        "name": "name", "gender": "gender", "generation": "generation",
                        "branch": "branch", "spouse": "spouse", "notes": "bio",
                        "birthYear": "birth_year", "deathYear": "death_year",
                    }
                    attr = field_map.get(key)
                    if attr and hasattr(person, attr):
                        setattr(person, attr, str(value) if value is not None else None)

        db.commit()
        db.refresh(sub)
        return sub

    raise HTTPException(status_code=400, detail="action 必須為 approve 或 reject")


# ============ USERS ============

@router.get("/users", response_model=list[UserInfo])
def list_users(
    status: str | None = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(User)
    if status:
        q = q.filter(User.status == status)
    return q.order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}", response_model=UserInfo)
def update_user(
    user_id: int,
    role: str | None = None,
    status: str | None = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="會員不存在")

    if role and role in ("admin", "member"):
        user.role = role
    if status and status in ("pending", "active", "rejected", "suspended"):
        user.status = status

    db.commit()
    db.refresh(user)
    return UserInfo.model_validate(user)


# ============ PERSONS (direct admin CRUD) ============

@router.put("/persons/{person_id}")
def update_person(
    person_id: int,
    data: dict,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="族人不存在")

    field_map = {
        "name": "name", "gender": "gender", "generation": "generation",
        "branch": "branch", "spouse": "spouse", "notes": "bio",
        "birthYear": "birth_year", "deathYear": "death_year",
    }
    for key, value in data.items():
        attr = field_map.get(key)
        if attr and hasattr(person, attr):
            setattr(person, attr, str(value) if value is not None else None)

    db.commit()
    db.refresh(person)
    return {"message": f"已更新 {person.name}", "id": person.id}


@router.delete("/persons/{person_id}")
def delete_person(
    person_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="族人不存在")

    # 子女的 father_id 設為 null
    db.query(Person).filter(Person.father_id == person_id).update({"father_id": None})
    db.delete(person)
    db.commit()
    return {"message": f"已刪除 {person.name}"}
