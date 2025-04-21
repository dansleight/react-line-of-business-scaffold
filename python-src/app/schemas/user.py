from pydantic import BaseModel, ConfigDict
from app.utils.naming import to_camel_case

class UserBase(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel_case,
        populate_by_name=True,
        from_attributes=True,
    )
    Email: str
    Role: str | None = None
