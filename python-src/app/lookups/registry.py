from collections.abc import Callable, Sequence
from dataclasses import dataclass
from typing import Optional

from .lookup_item import LookupItem
from .lookup_model import LookupModel
from .lookup_type import LookupType


@dataclass(frozen=True)
class LookupSource:
    lookup_type: LookupType
    parent_lookup_type: Optional[LookupType]
    load: Callable[[], Sequence[LookupItem]]


_SOURCES: list[LookupSource] = []


def register_lookup(source: LookupSource) -> LookupSource:
    """Register a lookup bag the SPA can load via GET /api/lookup."""
    _SOURCES.append(source)
    return source


def all_lookups() -> list[LookupModel]:
    return [
        LookupModel.create(
            lookup_type=source.lookup_type,
            parent_lookup_type=source.parent_lookup_type,
            items=list(source.load()),
        )
        for source in _SOURCES
    ]


def lookup_by_type(lookup_type: LookupType) -> Optional[LookupModel]:
    for source in _SOURCES:
        if source.lookup_type == lookup_type:
            return LookupModel.create(
                lookup_type=source.lookup_type,
                parent_lookup_type=source.parent_lookup_type,
                items=list(source.load()),
            )
    return None
