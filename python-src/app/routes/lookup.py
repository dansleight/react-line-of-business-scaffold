from typing import List

from fastapi import APIRouter, Depends

from app.auth.auth_user import AuthUser
from app.auth.dependencies import validate_token
from app.errors import API_ERROR_RESPONSES, InvalidRequestError
from app.lookups import LookupModel, LookupType, all_lookups, lookup_by_type

router = APIRouter(prefix="/api/lookup", tags=["Lookup"])


@router.get(
    "",
    response_model=List[LookupModel],
    summary="Get all lookup bags",
    operation_id="lookupAll",
    responses={
        401: API_ERROR_RESPONSES[401],
        500: API_ERROR_RESPONSES[500],
    },
)
async def all_lookup_models(_auth_user: AuthUser = Depends(validate_token)) -> List[LookupModel]:
    return all_lookups()


@router.get(
    "/type/{lookupType}",
    response_model=LookupModel,
    summary="Get a single lookup bag by type",
    operation_id="lookupType",
    responses={
        400: API_ERROR_RESPONSES[400],
        401: API_ERROR_RESPONSES[401],
        500: API_ERROR_RESPONSES[500],
    },
)
async def lookup_type(
    lookupType: LookupType,
    _auth_user: AuthUser = Depends(validate_token),
) -> LookupModel:
    if lookupType == LookupType.Unknown:
        raise InvalidRequestError("Unknown Lookup Type provided.")
    model = lookup_by_type(lookupType)
    if model is None:
        raise InvalidRequestError("Unknown Lookup Type provided.")
    return model
