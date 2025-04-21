from sqlalchemy import Column, String
from app.database.config import Base

class User(Base):
    __tablename__ = "dat_user"
    Email = Column(String(255), primary_key=True, nullable=False)
    Role = Column(String(255), nullable=False)