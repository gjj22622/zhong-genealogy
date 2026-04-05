from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class AddRequest(Base):
    """新增成員申請"""
    __tablename__ = "add_requests"

    id = Column(Integer, primary_key=True, index=True)
    submitter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending", index=True, comment="pending / approved / rejected")

    # 新成員資料
    name = Column(String(50), nullable=False)
    generation = Column(Integer)
    branch = Column(String(50))
    gender = Column(String(10))
    birth_year = Column(String(50))
    spouse = Column(String(50))
    bio = Column(Text)
    father_person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)

    reason = Column(Text, comment="申請說明")
    reject_reason = Column(Text, comment="拒絕原因")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True))

    submitter = relationship("User")
    father_person = relationship("Person")


class EditRequest(Base):
    """修改資料請求"""
    __tablename__ = "edit_requests"

    id = Column(Integer, primary_key=True, index=True)
    submitter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False)
    status = Column(String(20), default="pending", index=True)

    changes = Column(JSON, nullable=False, comment="修改內容，格式：{欄位: {old: 原值, new: 新值}}")
    reason = Column(Text)
    reject_reason = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True))

    submitter = relationship("User")
    person = relationship("Person")
