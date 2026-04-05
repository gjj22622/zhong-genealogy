from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class Submission(Base):
    """統一的提交審核記錄（新增或修改族人）"""
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False, comment="add / edit")
    target_person_id = Column(Integer, ForeignKey("persons.id"), nullable=True, comment="編輯時的目標族人")
    data = Column(JSON, nullable=False, comment="提交的族人資料 JSON")
    status = Column(String(20), default="pending", nullable=False, index=True, comment="pending / approved / rejected")
    admin_notes = Column(Text, nullable=True, comment="管理員備註/退回原因")
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    target_person = relationship("Person")
