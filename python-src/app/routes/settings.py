from fastapi import APIRouter
from app.logging.config import logger
from app.auth.config import API_AUDIENCE, TENANT_ID, API_SCOPE
from app.schemas.global_settings import GlobalSettingsModel

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get(
    "",
    response_model=GlobalSettingsModel,
    summary="Get Global Settings",
    description="Returns the necessary settings for the SPA to initialize",
    operation_id="settingsGet"
)
async def get_GlobalSettings():
    return { 
        "ApplicationMode": "Development", 
        "MsalSettings" : {
            "ClientId": API_AUDIENCE,
            "Authority": f"https://login.microsoftonline.com/{TENANT_ID}",
            "ApiScope": API_SCOPE
    }}