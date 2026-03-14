from fastapi import APIRouter
from app.logging.config import logger
from app.schemas.global_settings import GlobalSettingsModel
from app.config import settings

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
        "ApplicationMode": settings.environment, 
        "MsalSettings" : {
            "ClientId": settings.client_id,
            "Authority": settings.authority,
            "ApiScope": settings.api_scope,
            "Provider": settings.id_provider,
    }}