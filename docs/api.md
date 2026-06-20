# REST API reference

Base URL: `http://127.0.0.1:8000/api/v1`

Payloads are JSON. The API currently has no authentication. Interactive, code-derived documentation is available at `/docs` and `/redoc` while the backend runs.

List endpoints accept `skip` (default `0`, minimum `0`) and `limit` (default `100`, range `1`–`500`) and return:

```json
{"total": 0, "items": []}
```

Common errors are `404` for a missing entity, `409` for uniqueness/referential conflicts, and `422` for request validation or insufficient stock. Error bodies generally use `{"detail":"..."}`.

## Products

| Method | Path | Result |
| --- | --- | --- |
| GET | `/products/` | Paginated products |
| GET | `/products/{product_id}` | One product |
| POST | `/products/` | Create product (`201`) |
| PUT | `/products/{product_id}` | Replace name, price, and stock; SKU stays unchanged |
| DELETE | `/products/{product_id}` | Delete (`204`); conflicts if used by an order |

Create body:

```json
{
  "name": "Wireless Mouse",
  "sku": "MOUSE-01",
  "price": 25.50,
  "quantity_in_stock": 100
}
```

`name` and `sku` are trimmed, and `sku` is stored uppercase. SKU is unique, price is non-negative with at most two decimal places, and stock is a non-negative integer. The API does not otherwise restrict SKU characters.

PUT body (all fields required):

```json
{
  "name": "Wireless Mouse Pro",
  "price": 29.99,
  "quantity_in_stock": 80
}
```

Product response:

```json
{
  "id": 1,
  "name": "Wireless Mouse",
  "sku": "MOUSE-01",
  "price": "25.50",
  "quantity_in_stock": 100
}
```

Decimal fields may be serialized as JSON strings by Pydantic.

## Customers

| Method | Path | Result |
| --- | --- | --- |
| GET | `/customers/` | Paginated customers |
| GET | `/customers/{customer_id}` | One customer |
| POST | `/customers/` | Create customer (`201`) |
| DELETE | `/customers/{customer_id}` | Delete (`204`); conflicts if orders exist |

Create body:

```json
{
  "full_name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone_number": "+1 555-0211"
}
```

Email is validated, lowercased, and unique. `phone_number` is optional; when supplied it must contain 7–15 digits and be no longer than 20 characters.

## Orders

| Method | Path | Result |
| --- | --- | --- |
| GET | `/orders/` | Paginated orders, newest first |
| GET | `/orders/{order_id}` | One order with customer and line items |
| POST | `/orders/` | Place order (`201`) |
| DELETE | `/orders/{order_id}` | Cancel/delete order and restore stock (`204`) |

Create body:

```json
{
  "customer_id": 1,
  "items": [
    {"product_id": 1, "quantity": 2},
    {"product_id": 2, "quantity": 1}
  ]
}
```

At least one item is required. IDs and quantities must be positive, and a product may appear only once per request. The server locks selected product rows, checks stock, decrements quantities, snapshots unit prices, and calculates the total. Missing products return `404`; duplicate product lines return `400`; insufficient stock returns `422`.

Order response:

```json
{
  "id": 1,
  "customer_id": 1,
  "total_amount": "51.00",
  "created_at": "2026-06-20T14:40:00+05:30",
  "customer": {
    "id": 1,
    "full_name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone_number": "+1 555-0211"
  },
  "order_items": [
    {
      "id": 1,
      "order_id": 1,
      "product_id": 1,
      "quantity": 2,
      "unit_price": "25.50",
      "subtotal": "51.00",
      "product": {
        "id": 1,
        "name": "Wireless Mouse",
        "sku": "MOUSE-01",
        "price": "25.50",
        "quantity_in_stock": 98
      }
    }
  ]
}
```

The response field is `order_items` (not `items`). Each line includes the current product record for display; `unit_price` remains the historical price snapshot used for the order total.

## Service-only operations

The codebase contains partial-update service methods and schemas for products/customers, but no PATCH routes expose them. They are not part of the public HTTP API.
