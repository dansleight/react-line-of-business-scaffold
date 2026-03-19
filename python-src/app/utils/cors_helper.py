import re
from urllib.parse import urlsplit
from app.config import settings
from fastapi import Request
from fastapi.responses import JSONResponse

LOCALHOST_ORIGIN_REGEX = re.compile(r"^http://localhost(:[0-9]+)?$")

def add_dev_cors_headers(request: Request, response: JSONResponse) -> JSONResponse:
    if settings.environment.lower() != "development":
        return response
    
    origin = request.headers.get("origin")
    if origin and LOCALHOST_ORIGIN_REGEX.match(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
        return response
    
    referer = request.headers.get("referer")
    if referer:
        try:
            parsed = urlsplit(referer)
            referer_origin = f"{parsed.scheme}://{parsed.netloc}"
            if LOCALHOST_ORIGIN_REGEX.match(referer_origin):
                response.headers["Access-Control-Allow-Origin"] = referer_origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Vary"] = "Origin"
        except Exception:
            pass
    return response