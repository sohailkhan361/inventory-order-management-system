from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductPutUpdate, ProductResponse, ProductListResponse
)
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "/",
    response_model=ProductListResponse,
    summary="List all products",
    description="Returns a paginated list of all products in the inventory."
)
def list_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
):
    total, items = ProductService.get_all(db, skip=skip, limit=limit)
    return ProductListResponse(total=total, items=items)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get a product by ID",
)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return ProductService.get_by_id(db, product_id)


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="SKU must be unique across all products. Stock quantity cannot be negative."
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return ProductService.create(db, payload)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Fully replace a product",
    description="All fields (name, price, quantity_in_stock) are required. SKU cannot be changed after creation."
)
def update_product(
    product_id: int,
    payload: ProductPutUpdate,
    db: Session = Depends(get_db),
):
    return ProductService.put(db, product_id, payload)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
    description="Fails with 409 if the product is referenced by any existing order item."
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    ProductService.delete(db, product_id)
