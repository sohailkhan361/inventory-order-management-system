from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get(
    "/",
    response_model=OrderListResponse,
    summary="List all orders",
    description="Returns orders sorted by creation date (newest first), with customer and items embedded."
)
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    total, items = OrderService.get_all(db, skip=skip, limit=limit)
    return OrderListResponse(total=total, items=items)


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get an order by ID",
    description="Returns full order details including customer info and all line items."
)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return OrderService.get_by_id(db, order_id)


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Place a new order",
    description=(
        "Places an order for the given customer. "
        "Validates stock availability, decrements inventory atomically, "
        "and computes total_amount server-side. "
        "Fails with 422 if any product has insufficient stock."
    )
)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    return OrderService.create(db, payload)


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel an order",
    description="Cancels the order and restores the reserved stock back to inventory."
)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    OrderService.delete(db, order_id)
