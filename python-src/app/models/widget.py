from sqlalchemy import Column, String, Integer
from app.database.config import Base

class Widget(Base):
    __tablename__ = "dat_widget"
    WidgetId = Column(Integer, primary_key=True, nullable=False)
    Name = Column(String(255), nullable=False)
    Description = Column(String(255), nullable=True)