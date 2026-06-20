from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerService:
    """Business logic layer for Customer operations."""

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> tuple[int, list[Customer]]:
        query = db.query(Customer)
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return total, items

    @staticmethod
    def get_by_id(db: Session, customer_id: int) -> Customer:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with id={customer_id} not found"
            )
        return customer

    @staticmethod
    def get_by_email(db: Session, email: str) -> Customer | None:
        return db.query(Customer).filter(Customer.email == email.lower()).first()

    @staticmethod
    def create(db: Session, payload: CustomerCreate) -> Customer:
        # Normalize email to lowercase
        payload_dict = payload.model_dump()
        payload_dict["email"] = payload_dict["email"].lower()

        existing = CustomerService.get_by_email(db, payload_dict["email"])
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Customer with email '{payload.email}' already exists"
            )
        customer = Customer(**payload_dict)
        db.add(customer)
        try:
            db.commit()
            db.refresh(customer)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Customer with email '{payload.email}' already exists"
            )
        return customer

    @staticmethod
    def update(db: Session, customer_id: int, payload: CustomerUpdate) -> Customer:
        customer = CustomerService.get_by_id(db, customer_id)
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(customer, field, value)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def delete(db: Session, customer_id: int) -> None:
        customer = CustomerService.get_by_id(db, customer_id)
        try:
            db.delete(customer)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete customer who has existing orders"
            )
