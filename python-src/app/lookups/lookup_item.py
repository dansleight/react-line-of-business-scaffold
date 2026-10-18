from typing import Optional, Protocol

from pydantic import BaseModel
from app.schemas.config import MODEL_CONFIG


class LookupItemLike(Protocol):
    id: int
    parent_id: Optional[int]
    name: str
    active: bool


class ILookupItem(BaseModel):
    """SPA/OpenAPI name matches the C# ILookupItem contract."""

    model_config = MODEL_CONFIG
    Id: int
    ParentId: Optional[int] = None
    Name: str
    Active: bool = True

    @classmethod
    def from_item(cls, item: LookupItemLike) -> "ILookupItem":
        return cls(
            Id=getattr(item, "Id", getattr(item, "id")),
            ParentId=getattr(item, "ParentId", getattr(item, "parent_id", None)),
            Name=getattr(item, "Name", getattr(item, "name")),
            Active=getattr(item, "Active", getattr(item, "active", True)),
        )


LookupItem = ILookupItem
