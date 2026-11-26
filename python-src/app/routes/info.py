from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.auth.auth_user import AuthUser
from app.auth.dependencies import validate_token
from app.auth.auth_user import AuthUser
from app.auth.dependencies import validate_token
from app.auth.role_mapping import roles_for_user
from app.database.dependencies import get_db
from app.errors import API_ERROR_RESPONSES
from app.schemas.api_error import ApiError
from app.schemas.user_info import UserInfoModel
from app.services.avatar_service import AvatarService

router = APIRouter(prefix="/api/info", tags=["Info"])

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

@router.get(
    "",
    response_model=UserInfoModel,
    summary="Get the current user",
    operation_id="getUserInfo",
    responses={401: API_ERROR_RESPONSES[401], 500: API_ERROR_RESPONSES[500]},
)
async def get_user_info(auth_user: AuthUser = Depends(validate_token)) -> UserInfoModel:
    return UserInfoModel(
        PersonId=auth_user.get_person_id(),
        Email=auth_user.find_email(),
        DisplayName=auth_user.display_name(),
        Roles=roles_for_user(auth_user),
    )

@router.get(
    "/avatar",
    summary="Gets the current user's avatar (Graph, then Gravatar, then initials). Cached for seven days.",
    operation_id="getUserAvatar",
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
    operation_id="refreshUserAvatar",
    responses=_AVATAR_RESPONSES,
    response_class=Response,
)
async def refresh_avatar(
    auth_user: AuthUser = Depends(validate_token),
    db: Session = Depends(get_db),
) -> Response:
    avatar = await AvatarService(db).get_async(auth_user, force_refresh=True)
    return Response(content=avatar.content, media_type=avatar.content_type)