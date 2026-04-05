from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    old_id = Column(String(20), unique=True, index=True, comment="原始 HTML 資料中的 ID（如 p1, p2）")
    name = Column(String(50), nullable=False, index=True)
    generation = Column(Integer, comment="世代（第幾世）")
    branch = Column(String(50), comment="支系")
    gender = Column(String(10))
    birth_year = Column(String(50))
    death_year = Column(String(50))
    is_alive = Column(Boolean, default=True)
    spouse = Column(String(50))
    bio = Column(Text, comment="簡介")
    father_id = Column(Integer, ForeignKey("persons.id"), nullable=True)

    father = relationship("Person", remote_side=[id], backref="children")
