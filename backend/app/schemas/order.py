from datetime import datetime
from decimal import Decimal
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from app.schemas.order_item import OrderItemCreate, OrderItemResponse
from app.schemas.customer import CustomerResponse


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0, description="ID of the customer placing the order")
    items: list[OrderItemCreate] = Field(..., min_length=1, description="At least one item is required")


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    created_at: datetime
    customer: CustomerResponse | None = None
    order_items: list[OrderItemResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    total: int
    items: list[OrderResponse]
