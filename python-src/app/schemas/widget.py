from pydantic import BaseModel
from .config import MODEL_CONFIG

class AddWidgetModel(BaseModel):
    model_config = MODEL_CONFIG
    Name: str
    Description: str | None = None

class WidgetObject(BaseModel):
    model_config = MODEL_CONFIG
    WidgetId: int
    Name: str
    Description: str | None = None

