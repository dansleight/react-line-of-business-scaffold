from __future__ import annotations

import traceback
import uuid
from typing import Any, Optional

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.logging.config import logger
from app.schemas.api_error import ApiError, ApiErrorException
from app.utils.cors_helper import add_dev_cors_headers


class AppError(Exception):
    def __init__(
        self,
        status: int,
        code: str,
        user_message: str,
        message: Optional[str] = None,
        errors: Optional[dict[str, list[str]]] = None,
    ):
        super().__init__(user_message)
        self.status = status
        self.code = code
        self.user_message = user_message
        self.message = message
        self.errors = errors


class ValidationException(AppError):
    def __init__(self, message: str, errors: dict[str, list[str]]):
        super().__init__(400, "validation", message, message, errors)

    @staticmethod
    def for_field(field: str, error: str, message: Optional[str] = None) -> "ValidationException":
        return ValidationException(message or error, {field: [error]})


class NotFoundError(AppError):
    def __init__(self, user_message: str = "The requested resource was not found."):
        super().__init__(404, "not_found", user_message)


class UnauthorizedError(AppError):
    def __init__(self, user_message: str = "You are not authorized to perform this action."):
        super().__init__(401, "unauthorized", user_message)
        self.headers = {"WWW-Authenticate": "Bearer"}


class InvalidRequestError(AppError):
    def __init__(self, user_message: str, message: Optional[str] = None):
        super().__init__(400, "invalid", user_message, message)


def trace_id_for(request: Request) -> str:
    return request.headers.get("x-correlation-id") or request.headers.get("x-request-id") or uuid.uuid4().hex


def exception_payload(exc: BaseException) -> ApiErrorException:
    inner = exception_payload(exc.__cause__) if exc.__cause__ else None
    return ApiErrorException(
        type=f"{exc.__class__.__module__}.{exc.__class__.__name__}"
        if exc.__class__.__module__ not in ("builtins", None)
        else exc.__class__.__name__,
        message=str(exc),
        stack_trace="".join(traceback.format_exception(exc)),
        inner=inner,
    )


def from_exception(exc: Exception, trace_id: str) -> ApiError:
    development = settings.environment.lower() == "development"

    if isinstance(exc, AppError):
        error = ApiError(
            status=exc.status,
            code=exc.code,
            user_message=exc.user_message,
            message=exc.message,
            trace_id=trace_id,
            errors=exc.errors,
        )
    elif isinstance(exc, PermissionError):
        error = ApiError(
            status=401,
            code="unauthorized",
            user_message="You are not authorized to perform this action.",
            message=f"{exc.__class__.__name__}: {exc}",
            trace_id=trace_id,
        )
    elif isinstance(exc, ValueError):
        error = ApiError(
            status=400,
            code="invalid",
            user_message="The request is invalid.",
            message=f"{exc.__class__.__name__}: {exc}",
            trace_id=trace_id,
        )
    else:
        error = ApiError(
            status=500,
            code="unhandled",
            user_message=f"Something went wrong. Reference {trace_id}.",
            message=f"{exc.__class__.__name__}: {exc}",
            trace_id=trace_id,
        )

    if development:
        error.exception = exception_payload(exc)
        if error.message is None:
            error.message = f"{exc.__class__.__name__}: {exc}"

    return error


def json_error(request: Request, error: ApiError, headers: Optional[dict[str, str]] = None) -> JSONResponse:
    response = JSONResponse(
        status_code=error.status,
        content=error.model_dump(by_alias=True, exclude_none=True),
        headers=headers,
    )
    return add_dev_cors_headers(request, response)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    error = from_exception(exc, trace_id_for(request))
    if error.status >= 500:
        logger.error("Unhandled exception %s", error.trace_id, exc_info=exc)
    else:
        logger.warning("Request failed %s %s", error.code, error.trace_id)
    headers = getattr(exc, "headers", None)
    return json_error(request, error, headers)


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    error = from_exception(exc, trace_id_for(request))
    if error.status >= 500:
        logger.error(
            "Unhandled exception occurred",
            extra={
                "method": request.method,
                "url": str(request.url),
                "exception": repr(exc),
                "traceback": traceback.format_exc(),
                "trace_id": error.trace_id,
            },
        )
    else:
        logger.warning("Request failed %s %s", error.code, error.trace_id)
    return json_error(request, error)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict) and "userMessage" in detail:
        error = ApiError.model_validate(detail)
        error.status = exc.status_code
        error.trace_id = error.trace_id or trace_id_for(request)
        return json_error(request, error, exc.headers)

    message = detail if isinstance(detail, str) else str(detail)
    code = {400: "invalid", 401: "unauthorized", 403: "unauthorized", 404: "not_found"}.get(
        exc.status_code, "unhandled"
    )
    user_message = message
    if exc.status_code >= 500:
        user_message = f"Something went wrong. Reference {trace_id_for(request)}."
    error = ApiError(
        status=exc.status_code,
        code=code,
        user_message=user_message,
        message=message if settings.environment.lower() == "development" or exc.status_code < 500 else None,
        trace_id=trace_id_for(request),
    )
    return json_error(request, error, exc.headers)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors: dict[str, list[str]] = {}
    for err in exc.errors():
        loc: Any = err.get("loc") or ()
        key = ".".join(str(part) for part in loc if part not in ("body", "query", "path", "header"))
        if not key:
            key = "request"
        msg = err.get("msg") or "The input was not valid."
        errors.setdefault(key, []).append(msg)

    error = ApiError(
        status=400,
        code="validation",
        user_message="The inputs supplied to the API are invalid.",
        message="Invalid arguments to the API",
        trace_id=trace_id_for(request),
        errors=errors,
    )
    return json_error(request, error)


API_ERROR_RESPONSES = {
    400: {"model": ApiError, "description": "Bad Request"},
    401: {"model": ApiError, "description": "Unauthorized"},
    404: {"model": ApiError, "description": "Not Found"},
    500: {"model": ApiError, "description": "Internal Server Error"},
}
