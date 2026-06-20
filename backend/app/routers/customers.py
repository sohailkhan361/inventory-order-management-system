from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.customer import (
    CustomerCreate, CustomerResponse, CustomerListResponse
)
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get(
    "/",
    response_model=CustomerListResponse,
    summary="List all customers",
)
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    total, items = CustomerService.get_all(db, skip=skip, limit=limit)
    return CustomerListResponse(total=total, items=items)


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get a customer by ID",
)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return CustomerService.get_by_id(db, customer_id)


@router.post(
    "/",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
    description="Email must be unique. Email is stored in lowercase."
)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return CustomerService.create(db, payload)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer",
    description="Fails with 409 if the customer has existing orders."
)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    CustomerService.delete(db, customer_id)
