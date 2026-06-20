import re
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field, EmailStr, field_validator


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Customer's full name")
    email: EmailStr = Field(..., description="Unique email address")
    phone_number: str | None = Field(None, max_length=20, description="Optional phone number")

    @field_validator("full_name")
    @classmethod
    def name_strip(cls, v: str) -> str:
        return v.strip()

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return v
        digits_only = re.sub(r"\D", "", v)
        if len(digits_only) < 7 or len(digits_only) > 15:
            raise ValueError("Phone number must have 7–15 digits")
        return v.strip()


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    phone_number: str | None = Field(None, max_length=20)


class CustomerResponse(CustomerBase):
    id: int

    model_config = {"from_attributes": True}


class CustomerListResponse(BaseModel):
    total: int
    items: list[CustomerResponse]
