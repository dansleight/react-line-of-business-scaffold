from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.auth.auth_user import AuthUser
from app.auth.dependencies import validate_token
from app.config import settings
from app.database.dependencies import get_db
from app.errors import API_ERROR_RESPONSES
from app.schemas.api_error import ApiError
from app.schemas.global_settings import GlobalSettingsModel, MsalSettingsModel
from app.services.avatar_service import AvatarService

router = APIRouter(prefix="/api/settings", tags=["Settings"])

_AVATAR_RESPONSES = {
    200: {
        "content": {
            "image/jpeg": {"schema": {"type": "string", "format": "binary"}},
            "image/png": {"schema": {"type": "string", "format": "binary"}},
            "image/svg+xml": {"schema": {"type": "string", "format": "binary"}},
        },
        "description": "User avatar image",
    },
    401: {"model": ApiError, "description": "Unauthorized"},
    500: {"model": ApiError, "description": "Internal Server Error"},
}


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
    operation_id="settingsGet",
    responses={500: API_ERROR_RESPONSES[500]},
)
async def get_global_settings() -> GlobalSettingsModel:
    return GlobalSettingsModel(
        ApplicationMode=settings.application_mode,
        MsalSettings=_msal_settings(),
        BuildNumber=settings.public_build_number,
    )


@router.get(
    "/avatar",
    summary="Gets the current user's avatar (Graph, then Gravatar, then initials). Cached for seven days.",
    operation_id="settingsAvatar",
    responses=_AVATAR_RESPONSES,
    response_class=Response,
)
async def get_avatar(
    auth_user: AuthUser = Depends(validate_token),
    db: Session = Depends(get_db),
) -> Response:
    avatar = await AvatarService(db).get_async(auth_user)
    return Response(content=avatar.content, media_type=avatar.content_type)


@router.post(
    "/avatar/refresh",
    summary="Forces a refresh of the current user's avatar from Graph / Gravatar / initials.",
    operation_id="settingsRefreshAvatar",
    responses=_AVATAR_RESPONSES,
    response_class=Response,
)
async def refresh_avatar(
    auth_user: AuthUser = Depends(validate_token),
    db: Session = Depends(get_db),
) -> Response:
    avatar = await AvatarService(db).get_async(auth_user, force_refresh=True)
    return Response(content=avatar.content, media_type=avatar.content_type)
