from datetime import datetime

from sqlalchemy import Column, DateTime, LargeBinary, String

from app.database.config import Base


class UserAvatar(Base):
    __tablename__ = "dat_UserAvatar"

    PersonId = Column(String(250), primary_key=True, nullable=False)
    Source = Column(String(20), nullable=False)
    ContentType = Column(String(100), nullable=False)
    Content = Column(LargeBinary, nullable=False)
    UpdatedOn = Column(DateTime, nullable=False, default=datetime.now)
