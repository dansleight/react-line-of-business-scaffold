from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from typing import List, Dict
from app.database.dependencies import get_db
from app.auth.dependencies import validate_token
from app.models.widget import Widget
from app.schemas.widget import WidgetObject, AddWidgetModel
from app.logging.config import logger

router = APIRouter(prefix="/api/widget", tags=["Widget"])

@router.get(
    "", 
    response_model=List[WidgetObject], 
    summary="Get all widgets", 
    description="Retrieve a list of all widgets from the database. Requires authentication.",
    operation_id="widgetGet"
)
async def get_widgets(db: Session = Depends(get_db), payload: Dict = Depends(validate_token)):
    logger.debug("Fetching all widgets", extra={"user_id": payload.get("sub")})
    widgets = db.query(Widget).all()
    # Map SQLAlchemy models to Pydantic schemas
    widget_responses = [WidgetObject.model_validate(widget) for widget in widgets]
    logger.info("Retrieved widgets", extra={"count": len(widgets)})
    return widgets

@router.post(
    "",
    response_model=WidgetObject,
    summary="Create a new widget",
    description="Add a new widget to the database with name and description. Requires authentication.",
    operation_id="widgetAdd"
)
async def create_widget(widget: AddWidgetModel, db: Session = Depends(get_db), payload: Dict = Depends(validate_token)):
    logger.debug("Creating widget", extra={"name": widget.Name, "widget_id": payload.get("sub")})
    try:
        db_widget = Widget(Name=widget.Name, Description=widget.Description)
        db.add(db_widget)
        db.commit()
        db.refresh(db_widget)
        logger.info("Widget created", extra={"name": widget.Name})
        return WidgetObject.model_validate(db_widget)
    except Exception as e:
        logger.error("Failed to create widget", extra={"name": widget.Name, "error": str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create widget")

@router.get(
    "/get/{id}", 
    response_model=WidgetObject,
    summary="Get widget by WidgetId",
    description="Retrieve a widget by WidgetId using a raw SQL query. Requires authentication.",
    operation_id="widgetGetOne"
)
async def get_widget_by_id(id: int, db: Session = Depends(get_db), payload: Dict = Depends(validate_token)):
    logger.debug("Fetching widget by WidgetId", extra={"widgetId": id, "user_id": payload.get("sub")})
    query = text("SELECT WidgetId, Name, Description FROM dat_Widget WHERE WidgetId = :widgetId")
    result = db.execute(query, {"widgetId": id}).fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Widget not found")
    logger.info("Widget retrieved", extra={"widgetId": id})
    return result;