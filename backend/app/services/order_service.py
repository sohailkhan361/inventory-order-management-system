from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services.customer_service import CustomerService


class OrderService:
    """Business logic layer for Order operations.

    Key rules enforced:
    - Customer must exist.
    - Each product in the order must exist.
    - Ordered quantity must not exceed available stock.
    - Stock is decremented atomically within the same transaction.
    - total_amount is always computed server-side (sum of qty * price per line).
    - unit_price is snapshotted from the current product price at order time.
    """

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> tuple[int, list[Order]]:
        query = db.query(Order).options(
            joinedload(Order.customer),
            joinedload(Order.order_items).joinedload(OrderItem.product),
        )
        total = db.query(Order).count()
        items = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
        return total, items

    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Order:
        order = (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.order_items).joinedload(OrderItem.product),
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id={order_id} not found"
            )
        return order

    @staticmethod
    def create(db: Session, payload: OrderCreate) -> Order:
        # 1. Validate customer exists
        CustomerService.get_by_id(db, payload.customer_id)

        # 2. Validate all products and check stock — collect with row-level lock
        order_items_data: list[tuple[Product, int]] = []
        seen_product_ids: set[int] = set()

        for item in payload.items:
            if item.product_id in seen_product_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Duplicate product_id={item.product_id} in order items. "
                           f"Combine quantities into a single line instead."
                )
            seen_product_ids.add(item.product_id)

            # Lock the row to prevent race conditions on concurrent orders
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with id={item.product_id} not found"
                )
            if product.quantity_in_stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                        f"Requested: {item.quantity}, Available: {product.quantity_in_stock}"
                    )
                )
            order_items_data.append((product, item.quantity))

        # 3. Create Order record
        order = Order(customer_id=payload.customer_id, total_amount=Decimal("0"))
        db.add(order)
        db.flush()  # get order.id without committing

        # 4. Create OrderItem records, decrement stock, accumulate total
        total_amount = Decimal("0")
        for product, quantity in order_items_data:
            unit_price = Decimal(str(product.price))
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
            )
            db.add(order_item)
            product.quantity_in_stock -= quantity
            total_amount += unit_price * quantity

        # 5. Set server-computed total
        order.total_amount = total_amount

        db.commit()
        db.refresh(order)

        # Reload with relationships
        return OrderService.get_by_id(db, order.id)

    @staticmethod
    def delete(db: Session, order_id: int) -> None:
        """Cancels an order and restores inventory."""
        order = OrderService.get_by_id(db, order_id)
        # Restore stock for each item
        for item in order.order_items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if product:
                product.quantity_in_stock += item.quantity
        db.delete(order)
        db.commit()
