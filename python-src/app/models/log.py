from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database.config import Base
from datetime import datetime

class Log(Base):
    __tablename__ = "dat_Log"
    Id = Column(Integer, primary_key=True)
    Timestamp = Column(DateTime, nullable=False, default=datetime.now())
    Level = Column(String(50), nullable=False)
    Message = Column(Text, nullable=False)
    Logger = Column(String(255))
    Context = Column(Text)
    Exception = Column(Text)