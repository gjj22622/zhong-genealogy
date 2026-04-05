from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="member")  # admin / member
    display_name = Column(String(50), nullable=False)
    phone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    line_id = Column(String(100), nullable=True)
    relation_claim = Column(String(500), nullable=True)  # e.g. "我是鍾俊雄的兒子"
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)  # linked person
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending / active / rejected / suspended
    created_at = Column(DateTime(timezone=True), server_default=func.now())
