from decimal import Decimal
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field, field_validator


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=100, description="Stock Keeping Unit — must be unique")
    price: Decimal = Field(..., ge=0, decimal_places=2, description="Unit price (non-negative)")
    quantity_in_stock: int = Field(..., ge=0, description="Available stock (non-negative)")

    @field_validator("sku")
    @classmethod
    def sku_uppercase(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("name")
    @classmethod
    def name_strip(cls, v: str) -> str:
        return v.strip()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    price: Decimal | None = Field(None, ge=0, decimal_places=2)
    quantity_in_stock: int | None = Field(None, ge=0)


class ProductResponse(ProductBase):
    id: int

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    total: int
    items: list[ProductResponse]
