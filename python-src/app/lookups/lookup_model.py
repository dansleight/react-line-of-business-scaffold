from datetime import datetime
from typing import Optional, Sequence

from pydantic import BaseModel, Field
from app.schemas.config import MODEL_CONFIG
from .lookup_item import ILookupItem, LookupItem
from .lookup_type import LookupType


class LookupModel(BaseModel):
    model_config = MODEL_CONFIG
    LoadTime: datetime = Field(default_factory=datetime.now)
    LookupType: LookupType
    ParentLookupType: Optional[LookupType] = None
    Items: list[ILookupItem] = Field(default_factory=list)

    @classmethod
    def create(
        cls,
        lookup_type: LookupType,
        items: Sequence[LookupItem],
        parent_lookup_type: Optional[LookupType] = None,
    ) -> "LookupModel":
        return cls(
            LookupType=lookup_type,
            ParentLookupType=parent_lookup_type,
            Items=list(items),
        )
