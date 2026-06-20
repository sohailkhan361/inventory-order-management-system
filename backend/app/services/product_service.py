from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    """Business logic layer for Product operations."""

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> tuple[int, list[Product]]:
        query = db.query(Product)
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return total, items

    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id={product_id} not found"
            )
        return product

    @staticmethod
    def get_by_sku(db: Session, sku: str) -> Product | None:
        return db.query(Product).filter(Product.sku == sku.upper()).first()

    @staticmethod
    def create(db: Session, payload: ProductCreate) -> Product:
        existing = ProductService.get_by_sku(db, payload.sku)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{payload.sku}' already exists"
            )
        product = Product(**payload.model_dump())
        db.add(product)
        try:
            db.commit()
            db.refresh(product)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{payload.sku}' already exists"
            )
        return product

    @staticmethod
    def update(db: Session, product_id: int, payload: ProductUpdate) -> Product:
        product = ProductService.get_by_id(db, product_id)
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product_id: int) -> None:
        product = ProductService.get_by_id(db, product_id)
        try:
            db.delete(product)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete product that is referenced by existing order items"
            )
