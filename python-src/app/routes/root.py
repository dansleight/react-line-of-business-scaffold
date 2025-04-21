from fastapi import APIRouter

router = APIRouter(tags=["Root"])

@router.get(
    "/",
    summary="Welcome endpoint",
    description="Unprotected endpoint returning a welcome message."
)
async def root():
    return {"message": "Hello, FastAPI!"}
