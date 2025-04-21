from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from typing import Dict
from .config import AUTHORITY, API_AUDIENCE, JWKS_URL
from app.logging.config import logger

security = HTTPBearer()

async def get_jwks() -> Dict:
    async with httpx.AsyncClient(verify=False) as client:  # Keep for Zscaler
        response = await client.get(JWKS_URL)
        response.raise_for_status()
        return response.json()

async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    token = credentials.credentials
    logger.debug("Validating token", extra={"token_prefix": token[:10]})
    try:
        jwks = await get_jwks()
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=API_AUDIENCE,
            issuer=f"{AUTHORITY}/v2.0",
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