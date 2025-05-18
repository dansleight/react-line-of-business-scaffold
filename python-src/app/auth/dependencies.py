from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from typing import Dict
import time
from app.logging.config import logger
from app.config import settings

security = HTTPBearer()

# Cache to store JWKS
_jwks_cache = None
_jwks_expiry = 0
_JWKS_CACHE_TTL = 3600  # Cache JWKS for 1 hour

async def get_jwks() -> Dict:
    global _jwks_cache, _jwks_expiry
    current_time = time.time()

    # Return cached JWKS if it exists and hasn't expired
    if _jwks_cache is not None and current_time < _jwks_expiry:
        logger.debug("Using cached JWKS")
        return _jwks_cache

    # Fetch new JWKS
    logger.info("Fetching JWKS from IdP")
    async with httpx.AsyncClient(verify=False) as client:  # Keep for Zscaler
        try:
            response = await client.get(settings.jwks_url)
            response.raise_for_status()
            _jwks_cache = response.json()
            _jwks_expiry = current_time + _JWKS_CACHE_TTL
            logger.debug("JWKS cached successfully")
            return _jwks_cache
        except httpx.HTTPStatusError as e:
            logger.error("Failed to fetch JWKS", extra={"error": str(e)}, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to fetch JWKS",
            )

async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    token = credentials.credentials
    logger.debug("Validating token", extra={"token_prefix": token[:10]})
    try:
        jwks = await get_jwks()
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=settings.api_audience,
            issuer=f"{settings.authority}/v2.0",
        )
        logger.info("Token validated", extra={"user_id": payload.get("sub")})
        return payload
    except JWTError as e:
        logger.error("Token validation failed", extra={"error": str(e)}, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )