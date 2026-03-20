import re

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
import traceback
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException
# from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
import os
import time
from app.routes import global_settings, auth, widget, test
from app.logging.config import logger, shutdown_logging
from app.config import settings
from contextlib import asynccontextmanager

from app.utils.cors_helper import add_dev_cors_headers

@asynccontextmanager
async def lifespan(app: FastAPI):
    #startup
    logger.info("FastAPI application starting", extra={"version": "0.0.1", "environment": settings.environment})
    yield
    #shutdown
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
    }
)

# ────────────────────────────────────────────────
#  Global handler for ALL unhandled exceptions
# ────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full error (very important for debugging)
    logger.error(
        "Unhandled exception occurred",
        extra={
            "method": request.method,
            "url": str(request.url),
            "exception": repr(exc),
            "traceback": traceback.format_exc(),
        }
    )

    # Decide what to send to the client (keep it safe / no stack trace in production)
    detail = "An internal server error occurred. Consider notifying the development team"
    if settings.environment.lower() == "development":
        detail = f"Internal error: {repr(exc)}"

    response =  JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "code": 500,
            "message": detail,
            "error_type": exc.__class__.__name__,
        }
    )
    return add_dev_cors_headers(request, response)

@app.exception_handler(StarletteHTTPException)
@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "code": exc.status_code,
            "message": exc.detail,
        },
        headers=exc.headers if exc.headers else None,
    )

if (settings.environment.lower() == "development"):
    origins_regex = r"^http://localhost(:[0-9]+)?$"
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=origins_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

# Mount static files
app.mount("/static", StaticFiles(directory="client_app"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(widget.router)
app.include_router(global_settings.router)
app.include_router(test.router)

# Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    client = request.client.host if request.client else "unknown"

    logger.debug("Incoming request", extra={
        "method": request.method,
        "path": request.url.path,
        "client": client
    })

    try:
        response = await call_next(request)
        return response
    except Exception:
        logger.exception("Request failed", extra={
            "method": request.method,
            "path": request.url.path,
            "client": client
        })
        raise
    finally:
        duration = time.time() - start_time
        logger.info("Request completed", extra={
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else "unknown",
            "duration_ms": duration * 1000
        })

# Serve SPA for non-API, non-WebSocket, non-special routes
@app.get("/{path:path}")
async def serve_spa(path: str):
    # Skip API, WebSocket, and special routes
    protected_paths = ("/api", "/ws", "/swagger", "/redoc", "/openapi.json", "/static")
    if path.startswith(protected_paths):
        raise HTTPException(status_code=404, detail="Not found")

    # Serve SPA's index.html
    spa_index_path = Path("client_app/index.html")
    if not spa_index_path.exists():
        raise HTTPException(status_code=404, detail="SPA index.html not found")

    with open(spa_index_path, "r") as file:
        content = file.read()
    return HTMLResponse(content=content)

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="FastAPI Prototype API",
        version="1.0.0",
        description="A prototype API with Entra ID authentication and SQL Server integration",
        routes=app.routes,
    )
    
    # Add bearer security scheme for Entra ID
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter a valid Entra ID bearer token (JWT) obtained from your client application."
        }
    }

    # Apply security only to protected endpoints
    for path in openapi_schema["paths"]:
        if path in settings.open_paths:  # Unprotected endpoints
            for method in openapi_schema["paths"][path]:
                openapi_schema["paths"][path][method]["security"] = []
        else:  # Protected endpoints
            for method in openapi_schema["paths"][path]:
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
