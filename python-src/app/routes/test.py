from fastapi import APIRouter, Depends

from app.auth.auth_user import AuthUser
from app.auth.dependencies import validate_token
from app.errors import API_ERROR_RESPONSES, InvalidRequestError, NotFoundError
from app.logging.config import logger
from app.schemas.test import GoodModel

router = APIRouter(prefix="/api/test", tags=["Test"])


@router.get(
    "/{id}",
    response_model=GoodModel,
    summary="Gets a response that is based on the input.",
    description="If the id is 0, -1 or less than -1 will throw a specific error.",
    operation_id="testGet",
    responses={
        400: API_ERROR_RESPONSES[400],
        401: API_ERROR_RESPONSES[401],
        404: API_ERROR_RESPONSES[404],
        500: API_ERROR_RESPONSES[500],
    },
)
async def get_test(id: int, auth_user: AuthUser = Depends(validate_token)) -> GoodModel:
    logger.debug("Returning a test result", extra={"id": id, "user_id": auth_user.claims.get("sub")})
    if id == -1:
        raise RuntimeError("this error was intentionally thrown by specifying '-1' as the id value.")
    if id < -1:
        raise NotFoundError()
    if id == 0:
        raise InvalidRequestError(
            "The value of '0' that was requested is not available to this user.",
            "Bad request triggered by id of 0",
        )
    return GoodModel.from_id(id)
