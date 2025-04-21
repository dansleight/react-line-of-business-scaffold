from fastapi import APIRouter, Depends
from typing import Dict
from app.auth.dependencies import validate_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get(
    "/check", 
    response_model=Dict,
    summary="Test protected endpoint",
    description="Verify Entra ID authentication and return user details from the JWT payload."
)
async def get(payload: Dict = Depends(validate_token)):
    return {"message": "Authenticated!", "user": payload.get("sub"), "scopes": payload.get("scp")}