from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.utils.naming import to_camel_case


class ApiErrorException(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel_case,
        populate_by_name=True,
    )
    type: str
    message: Optional[str] = None
    stack_trace: Optional[str] = Field(default=None, alias="stackTrace")
    inner: Optional["ApiErrorException"] = None


class ApiError(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel_case,
        populate_by_name=True,
    )
    status: int
    code: str
    user_message: str = Field(alias="userMessage")
    message: Optional[str] = None
    trace_id: str = Field(alias="traceId")
    errors: Optional[dict[str, list[str]]] = None
    exception: Optional[ApiErrorException] = None
