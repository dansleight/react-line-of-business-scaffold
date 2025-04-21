from pydantic import ConfigDict
from app.utils.naming import to_camel_case

MODEL_CONFIG = ConfigDict(
    alias_generator=to_camel_case,
    populate_by_name=True,
    from_attributes=True,
)