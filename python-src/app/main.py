from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os
import time
from app.routes import global_settings, auth, widget, test
from app.logging.config import logger, shutdown_logging
from app.config import settings
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    #startup
    logger.info("FastAPI application starting", extra={"version": "0.0.1"})
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
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
    logger.debug("Incoming request", extra={
        "method": request.method,
        "path": request.url.path,
        "client": request.client.host if request.client else "unknown"
    })
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info("Request completed", extra={
        "method": request.method,
        "path": request.url.path,
        "client": request.client.host if request.client else "unknown",
        "duration_ms": duration * 1000
    })
    return response

# Serve SPA for non-API, non-WebSocket, non-special routes
@app.get("/{path:path}")
async def serve_spa(path: str):
    # Skip API, WebSocket, and special routes
    protected_paths = ("/api", "/ws", "/swagger", "/redoc", "/openapi.json", "/static")
    if path.startswith(protected_paths):
        return {"error": "Not found"}, 404

    # Serve SPA's index.html
    spa_index_path = Path("client_app/index.html")
    if not spa_index_path.exists():
        return {"error": "SPA index.html not found"}, 404

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