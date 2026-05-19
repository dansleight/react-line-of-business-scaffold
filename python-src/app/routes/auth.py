from fastapi import APIRouter, Depends
from typing import Dict
from app.auth.auth_user import AuthUser
from app.auth.dependencies import validate_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get(
    "/check", 
    response_model=Dict,
    summary="Test protected endpoint",
    description="Verify Entra ID authentication and return user details from the JWT payload."
)
async def get(authUser: AuthUser = Depends(validate_token)):
    return {"message": "Authenticated!", "user": authUser.claims.get("sub"), "scopes": authUser.claims.get("scp")}