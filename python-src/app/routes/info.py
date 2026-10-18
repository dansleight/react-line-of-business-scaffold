from fastapi import APIRouter, Depends

from app.auth.auth_user import AuthUser
from app.auth.dependencies import validate_token
from app.auth.role_mapping import roles_for_user
from app.errors import API_ERROR_RESPONSES
from app.schemas.user_info import UserInfoModel

router = APIRouter(prefix="/api/info", tags=["Info"])


@router.get(
    "",
    response_model=UserInfoModel,
    summary="Get the current user",
    operation_id="infoGetUserInfoModel",
    responses={401: API_ERROR_RESPONSES[401], 500: API_ERROR_RESPONSES[500]},
)
async def get_user_info(auth_user: AuthUser = Depends(validate_token)) -> UserInfoModel:
    return UserInfoModel(
        PersonId=auth_user.get_person_id(),
        Email=auth_user.find_email(),
        DisplayName=auth_user.display_name(),
        Roles=roles_for_user(auth_user),
    )
