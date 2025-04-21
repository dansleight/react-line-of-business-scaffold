from fastapi import FastAPI, Request
from fastapi.openapi.utils import get_openapi
from app.auth.config import API_AUDIENCE
from app.routes import root, auth, widget, settings, test
from .config import OPEN_PATHS
from app.logging.config import logger
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={
        "tryItOutEnabled": True,  # Enable "Try it out" by default for all endpoints
        "persistAuthorization": True,  # Persist bearer token across requests
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include routers
app.include_router(root.router)
app.include_router(auth.router)
app.include_router(widget.router)
app.include_router(settings.router)
app.include_router(test.router)

# Log app startup
logger.info("Starting FastAPI Prototype API", extra={"version": "1.0.0"})

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
    logger.info("Request completed", extra = {
        "method": request.method,
        "path": request.url.path,
        "client": request.client.host if request.client else "unknown"
    })
    return response

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
        if path in OPEN_PATHS:  # Unprotected endpoints
            for method in openapi_schema["paths"][path]:
                openapi_schema["paths"][path][method]["security"] = []
        else:  # Protected endpoints
            for method in openapi_schema["paths"][path]:
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi