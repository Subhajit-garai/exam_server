# Admin Dashboard UI Context

This document provides context for the UI implementation of the "Admin Dashboard".

## Overview

The Admin Dashboard provides key metrics and statistics to the administrator.
Base URL: `/api/v1/admin/dashboard`
Authentication: Requires Admin Bearer Token.

## API Endpoints

### 1. Get Dashboard Stats
Fetches aggregated statistics for charts and summary cards.

- **Endpoint**: `GET /stats`
- **Query Params**:
  - `range`: Time range filter. Options: `24h`, `7d`, `1m`, `3m`, `1y`, `all` (Default: `24h` for charts, but metrics like Total Users are global).

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "paymentStats": {
      "totalRevenue": 1500, // In main currency unit (e.g. INR)
      "totalTransactions": 5, // Count of successful payments in range
      "range": "24h"
    },
    "activeUsers": {
      "onlineCount": 12, // Users currently online (isOnline: true)
      "recentlyActiveCount": 45 // Users seen in last 15 mins
    },
    "keyMetrics": {
      "totalUsers": 1205, // All time total users
      "totalRevenue": 50000, // All time total revenue
      "totalOrders": 300 // All time total orders
    }
  }
}
```

### 2. Get Payment History
Fetches a paginated list of recent payments/orders.

- **Endpoint**: `GET /payments`
- **Query Params**:
  - `page`: Page number (Default: 1)
  - `limit`: Items per page (Default: 10)
  - `range`: Time range filter (Default: `all`)

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "pay_123",
        "amount": 9900, // In smallest unit (paise) -> Divide by 100 for display
        "status": "captured",
        "createdAt": "2024-12-16T10:00:00.000Z",
        "User": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "totalDocs": 50,
      "totalPages": 5,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

## UI Components Suggestions

1.  **Summary Cards**:
    - **Total Users**: Display `keyMetrics.totalUsers`.
    - **Total Revenue**: Display `keyMetrics.totalRevenue`.
    - **Active Now**: Display `activeUsers.onlineCount`.

2.  **Revenue Chart**:
    - Although the current API returns a single aggregated number for the range (`paymentStats.totalRevenue`), for a line chart you might need a new endpoint that returns data points (e.g. revenue per day). *Currently, the API supports single value summary for the selected range.*

3.  **Recent Transactions Table**:
    - Use `GET /payments`.
    - Columns: User (Name/Email), Amount (Format `/ 100`), Status, Date.
    - Pagination controls.

4.  **Filters**:
    - Dropdown for "Time Range" (24h, 7d, 1m, etc.) affecting the Summary Cards (specifically Revenue/Transactions).
