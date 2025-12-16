# Coupon UI Context

This document provides context for the UI implementation of "Coupon" management (Admin Side).

## Overview

The Coupon system allows admins to create discount codes that users can apply during checkout.
Base URL: `/api/v1/admin/coupon`
Authentication: Requires Admin Bearer Token.

## Data Model

### Coupon
- `id`: string (CUID)
- `code`: string (Unique, e.g., "SALE50")
- `description`: string (Optional)
- `discountType`: Enum ("PERCENTAGE" | "FIXED")
- `discountValue`: number (Amount or %)
- `maxUses`: number (Optional, global total limit)
- `perUserLimit`: number (Optional, limit per user)
- `minOrderAmount`: number (Optional, minimum cart value)
- `expiresAt`: DateTime (Optional ISO string)
- `isActive`: Boolean (Default: true)
- `createdAt`: DateTime

## API Endpoints

### 1. Create Coupon
- **Endpoint**: `POST /`
- **Body**:
```json
{
  "code": "WELCOME20",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "description": "20% off for new users",
  "maxUses": 100,
  "minOrderAmount": 500,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

### 2. Get All Coupons
- **Endpoint**: `GET /`
- **Response**: List of coupons with creator info.

### 3. Get Coupon By ID
- **Endpoint**: `GET /:id`

### 4. Update Coupon
- **Endpoint**: `PUT /:id`
- **Body**: Partial update of fields.

### 5. Delete Coupon
- **Endpoint**: `DELETE /:id`

## UI Suggestions
- **List View**: Table showing Code, Discount, Usage stats (if available), Status (Active/Inactive), and Expiry.
- **Create/Edit Form**:
  - Code (Text input)
  - Type (Dropdown: Percentage/Fixed)
  - Value (Number input)
  - Expiry (Date picker)
  - Limits (Number inputs for Max Uses, Min Order)
  - Active Toggle.
