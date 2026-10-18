from pydantic import BaseModel, Field
from .config import MODEL_CONFIG


class UserInfoModel(BaseModel):
    model_config = MODEL_CONFIG
    PersonId: str
    Email: str | None = None
    DisplayName: str
    Roles: list[str] = Field(default_factory=list)
