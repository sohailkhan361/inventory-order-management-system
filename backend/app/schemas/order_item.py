from pydantic import BaseModel, Field
from decimal import Decimal
from app.schemas.product import ProductResponse


class OrderItemBase(BaseModel):
    product_id: int = Field(..., gt=0, description="ID of the product")
    quantity: int = Field(..., gt=0, description="Number of units ordered (must be > 0)")


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    unit_price: Decimal
    subtotal: Decimal
    product: ProductResponse | None = None

    model_config = {"from_attributes": True}
