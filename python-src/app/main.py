from contextlib import asynccontextmanager
from pathlib import Path
import time

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.auth.middleware import NormalizeAuthorizationHeaderMiddleware
from app.config import settings
from app.errors import (
    AppError,
    app_error_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.logging.config import logger, shutdown_logging
from app.routes import info, lookup, settings as settings_routes, test


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FastAPI application starting", extra={"version": "0.0.1", "environment": settings.environment})
    yield
    logger.info("FastAPI application shutting down")
    shutdown_logging()


app = FastAPI(
    lifespan=lifespan,
    docs_url="/swagger/index.html",
    redoc_url="/redoc",
    openapi_url="/swagger/v1/swagger.json",
    swagger_ui_parameters={
        "tryItOutEnabled": True,
        "persistAuthorization": True,
    },
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.add_middleware(NormalizeAuthorizationHeaderMiddleware)

if settings.environment.lower() == "development":
    origins_regex = r"^http://localhost(:[0-9]+)?$"
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=origins_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.mount("/static", StaticFiles(directory="client_app"), name="static")

app.include_router(settings_routes.router)
app.include_router(info.router)
app.include_router(lookup.router)
app.include_router(test.router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    client = request.client.host if request.client else "unknown"

    logger.debug(
        "Incoming request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "client": client,
        },
    )

    try:
        response = await call_next(request)
        return response
    except Exception:
        logger.exception(
            "Request failed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "client": client,
            },
        )
        raise
    finally:
        duration = time.time() - start_time
        logger.info(
            "Request completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else "unknown",
                "duration_ms": duration * 1000,
            },
        )


@app.get("/{path:path}", include_in_schema=False)
async def serve_spa(path: str):
    normalized = "/" + path.lstrip("/")
    protected_prefixes = ("/api", "/ws", "/swagger", "/redoc", "/openapi.json", "/static")
    if normalized.startswith(protected_prefixes):
        raise HTTPException(status_code=404, detail="Not found")

    spa_index_path = Path("client_app/index.html")
    if not spa_index_path.exists():
        raise HTTPException(status_code=404, detail="SPA index.html not found")

    with open(spa_index_path, "r") as file:
        content = file.read()
    return HTMLResponse(content=content)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Scaffold API",
        version="1.0.0",
        description="Scaffold API Prototype",
        routes=app.routes,
    )

    openapi_schema.setdefault("components", {})["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter a valid Entra ID bearer token (JWT) obtained from your client application.",
        }
    }

    http_methods = {"get", "post", "put", "patch", "delete", "options", "head"}
    for path, operations in openapi_schema["paths"].items():
        for method, operation in operations.items():
            if method not in http_methods or not isinstance(operation, dict):
                continue
            operation["security"] = [] if path in settings.open_paths else [{"BearerAuth": []}]
            responses = operation.get("responses")
            if isinstance(responses, dict):
                responses.pop("422", None)

    components = openapi_schema.get("components", {})
    schemas = components.get("schemas", {})
    for unused in ("HTTPValidationError", "ValidationError"):
        schemas.pop(unused, None)

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
