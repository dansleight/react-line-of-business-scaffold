from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from app.auth.dependencies import validate_token
from app.schemas.test import GoodModel, BadRequestModel
from app.logging.config import logger

router = APIRouter(prefix="/api/test", tags=["Test"])

@router.get(
    "/{id}",
    response_model=GoodModel,
    summary="Gets a response that is based on the input.",
    description="If the id is 0, -1 or -2 will throw a specific error.",
    operation_id="testGet"
)
async def get_test(id: int, payload: Dict = Depends(validate_token)):
    logger.debug("Returning a test result", extra={"id: ": id, "user_id": payload.get("sub")})
    if (id == -1):
        raise HTTPException(status_code=500, detail="this error was intentionally thrown by specifiying a '-1' as the id value.")
    if (id < -1):
        raise HTTPException(status_code=404, detail="Not Found")
    if (id == 0):
        raise HTTPException(status_code=400, detail="The value of '0' that was requested is not available to this user.")
    return {
        "id": id,
        "name": "Randon Name"
    }

@router.get(
    "/badtest",
    response_model=BadRequestModel,
    summary="Just gets a bad request response",
    operation_id="testGetBad"
)
async def get_badtest(payload: Dict = Depends(validate_token)):
    return {
        "message": "Bad request triggered by id of 0",
        "userMessage": "The value of '0' that was requested is not available to this user."
    }