from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from typing import List, Dict
from app.database.dependencies import get_db
from app.auth.dependencies import validate_token
from app.models.user import User
from app.schemas.user import UserBase
from app.logging.config import logger

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get(
    "", 
    response_model=List[UserBase], 
    summary="Get all users", 
    description="Retrieve a list of all users from the database. Requires authentication."
)
async def get_users(db: Session = Depends(get_db), payload: Dict = Depends(validate_token)):
    logger.debug("Fetching all users", extra={"user_id": payload.get("sub")})
    users = db.query(User).all()
    # Map SQLAlchemy models to Pydantic schemas
    user_responses = [UserBase.model_validate(user) for user in users]
    logger.info("Retrieved users", extra={"count": len(users)})
    return users

@router.post(
    "",
    response_model=UserBase,
    summary="Create a new user",
    description="Add a new user to the database with email and role. Requires authentication."
)
async def create_user(user: UserBase, db: Session = Depends(get_db), payload: Dict = Depends(validate_token)):
    logger.debug("Creating user", extra={"email": user.Email, "user_id": payload.get("sub")})
    try:
        db_user = User(Email=user.Email, Role=user.Role)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info("User created", extra={"email": user.Email})
        return UserBase.model_validate(db_user)
    except Exception as e:
        logger.error("Failed to create user", extra={"email": user.Email, "error": str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create user")

@router.get(
    "/raw/{email}", 
    response_model=UserBase,
    summary="Get user by email",
    description="Retrieve a user by email using a raw SQL query. Requires authentication."
)
async def get_user_by_email(email: str, db: Session = Depends(get_db), payload: Dict = Depends(validate_token)):
    logger.debug("Fetching user by email", extra={"email": email, "user_id": payload.get("sub")})
    query = text("SELECT Email, Role FROM dat_User WHERE Email = :email")
    result = db.execute(query, {"email": email}).fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    logger.info("User retrieved", extra={"email": email})
    return {"email": result.Email, "role": result.Role}