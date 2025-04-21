from pydantic import BaseModel
from .config import MODEL_CONFIG

class GoodModel(BaseModel):
    model_config = MODEL_CONFIG
    Id: int
    Name: str

class BadRequestModel(BaseModel):
    model_config = MODEL_CONFIG
    Message: str
    UserMessage: str | None