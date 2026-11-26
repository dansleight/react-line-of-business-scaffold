from fastapi import APIRouter

from app.config import settings
from app.errors import API_ERROR_RESPONSES
from app.schemas.global_settings import GlobalSettingsModel, MsalSettingsModel

router = APIRouter(prefix="/api/settings", tags=["Settings"])

def _msal_settings() -> MsalSettingsModel | None:
    if not settings.client_id or not settings.tenant_id or not settings.api_scope:
        return None
    return MsalSettingsModel(
        ClientId=settings.client_id,
        Authority=settings.authority,
        ApiScope=settings.api_scope,
        Provider=settings.id_provider,
    )

@router.get(
    "",
    response_model=GlobalSettingsModel,
    summary="Gets the global settings necessary for the SPA to start, including MSAL settings for Authentication",
    operation_id="getSettings",
    responses={500: API_ERROR_RESPONSES[500]},
)
async def get_global_settings() -> GlobalSettingsModel:
    return GlobalSettingsModel(
        ApplicationMode=settings.application_mode,
        MsalSettings=_msal_settings(),
        BuildNumber=settings.public_build_number,
    )
