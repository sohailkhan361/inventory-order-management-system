# REST API Specifications

The system exposes REST API resources under the prefix `/api/v1`. All payload formats are standard JSON.

---

## 🔒 Common HTTP Error Status Codes

- `200 OK` — Request completed successfully.
- `201 Created` — Resource created successfully.
- `204 No Content` — Action completed successfully (e.g. deletion), returning no response body.
- `400 Bad Request` — General client-side error.
- `404 Not Found` — Resource with the specified ID does not exist.
- `409 Conflict` — Action rejected due to a database state clash (e.g. duplicate SKU/Email, or deleting a referenced entity).
- `422 Unprocessable Entity` — Request schema failed Pydantic validation checks (e.g. negative quantities, invalid email formats, or insufficient stock).

---

## 📦 Products Endpoint (`/products`)

### 1. List Products
- **Verb**: `GET /products/`
- **Query Parameters**:
  - `skip` (integer, default `0`): Records to skip.
  - `limit` (integer, default `100`): Maximum records to return (max `500`).
- **Response Shape (`200 OK`)**:
  ```json
  {
    "total": 1,
    "items": [
      {
        "id": 1,
        "name": "Wireless Mouse",
        "sku": "MOUSE-WRLS-01",
        "price": 25.50,
        "quantity_in_stock": 98
      }
    ]
  }
  ```

### 2. Get Product By ID
- **Verb**: `GET /products/{product_id}`
- **Response Shape (`200 OK`)**:
  ```json
  {
    "id": 1,
    "name": "Wireless Mouse",
    "sku": "MOUSE-WRLS-01",
    "price": 25.50,
    "quantity_in_stock": 98
  }
  ```

### 3. Create Product
- **Verb**: `POST /products/`
- **Request Body Shape**:
  ```json
  {
    "name": "Mechanical Keyboard",
    "sku": "KEYB-MECH-02",
    "price": 79.99,
    "quantity_in_stock": 50
  }
  ```
- **Constraints**:
  - `sku` must be unique across all products (alphanumeric format).
  - `price` must be greater than `0`.
  - `quantity_in_stock` cannot be negative.
- **Response Shape (`201 Created`)**: Returns the newly created product entity (including generated database `id`).

### 4. Update Product
- **Verb**: `PUT /products/{product_id}`
- **Request Body Shape**:
  ```json
  {
    "name": "Mechanical Keyboard Pro",
    "price": 89.99,
    "quantity_in_stock": 45
  }
  ```
- **Constraints**:
  - All body fields are required for database substitution.
  - The `sku` is immutable and cannot be updated.
- **Response Shape (`200 OK`)**: Returns the modified product entity.

### 5. Delete Product
- **Verb**: `DELETE /products/{product_id}`
- **Errors**: `409 Conflict` if the product is already referenced in any placed customer orders.
- **Response Shape (`204 No Content`)**

---

## 👥 Customers Endpoint (`/customers`)

### 1. List Customers
- **Verb**: `GET /customers/`
- **Response Shape (`200 OK`)**:
  ```json
  {
    "total": 1,
    "items": [
      {
        "id": 1,
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "phone_number": "+1 555-0199"
      }
    ]
  }
  ```

### 2. Register Customer
- **Verb**: `POST /customers/`
- **Request Body Shape**:
  ```json
  {
    "full_name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone_number": "+1 555-0211"
  }
  ```
- **Constraints**:
  - `email` must be unique (stored and normalized to lowercase on the server).
  - `phone_number` is optional.
- **Response Shape (`201 Created`)**

### 3. Delete Customer
- **Verb**: `DELETE /customers/{customer_id}`
- **Errors**: `409 Conflict` if the customer has existing orders records.
- **Response Shape (`204 No Content`)**

---

## 🛒 Orders Endpoint (`/orders`)

### 1. List Orders
- **Verb**: `GET /orders/`
- **Sort**: Newest first.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "total": 1,
    "items": [
      {
        "id": 1,
        "customer_id": 1,
        "total_amount": 130.99,
        "created_at": "2026-06-20T14:40:00",
        "customer": {
          "id": 1,
          "full_name": "John Doe",
          "email": "john.doe@example.com",
          "phone_number": "+1 555-0199"
        },
        "items": [
          {
            "id": 1,
            "product_id": 1,
            "quantity": 2,
            "unit_price": 25.50
          }
        ]
      }
    ]
  }
  ```

### 2. View Order Details
- **Verb**: `GET /orders/{order_id}`
- **Response Shape (`200 OK`)**: Includes the complete order entity with nested customer profile object and an array of all associated item snapshots.

### 3. Create Order (Checkout)
- **Verb**: `POST /orders/`
- **Request Body Shape**:
  ```json
  {
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      },
      {
        "product_id": 2,
        "quantity": 1
      }
    ]
  }
  ```
- **Server Mechanics**:
  - Validates stock for each product within a row-locked transaction.
  - Decrements inventory stock quantities.
  - Snapshots current product prices and saves them into `order_items.unit_price`.
  - Computes `total_amount` on the server as `SUM(quantity × unit_price)`.
- **Response Shape (`201 Created`)**: Returns the generated order detail sheet.

### 4. Cancel Order
- **Verb**: `DELETE /orders/{order_id}`
- **Server Mechanics**:
  - Fetches the order items.
  - Restores stock levels for each item (adds item quantities back to product stock levels).
  - Deletes the order items and the order record.
- **Response Shape (`204 No Content`)**
