# Miscellaneous API Documentation

**Base URL Prefixes**:
*   Issue: `/api/v1/issue`
*   Event: `/api/v1/event`
*   Payment: `/api/v1/payment`
*   Metrix: `/api/v1/metrix`
*   Data Manage: `/api/v1/bulk`
*   Question Processing: `/api/v1/question-processing`

## Issue API
**Base URL**: `/api/v1/issue`

*(Based on `IssueRouter`)*
*   **POST** `/create`: Create an issue/ticket.
*   **GET** `/get`: Get user issues.
*   **GET** `/admin/getall`: Get all issues (Admin).
*   **PUT** `/admin/update`: Update issue status (Admin).

## Event API
**Base URL**: `/api/v1/event`

*(Based on `eventRouter`)*
*   **GET** `/get`: Get events.
*   **POST** `/admin/create`: Create event (Admin).
*   **DELETE** `/admin/delete`: Delete event (Admin).

## Payment API
**Base URL**: `/api/v1/payment`

*(Based on `paymentRouter`)*
*   **POST** `/create/order`: Create Razorpay order.
*   **POST** `/paymentverification`: Verify payment (Public).
*   **GET** `/history`: Get payment history.

## Metrix API
**Base URL**: `/api/v1/metrix`

*(Based on `metrixRoute`)*
*   **GET** `/dashboard`: Get dashboard metrics.
*   **GET** `/exam/:id`: Get specific exam metrics.

## Data Manage (Bulk) API
**Base URL**: `/api/v1/bulk`

*(Based on `DataManageRouter`)*
*   **POST** `/questions`: Bulk upload questions.
*   **POST** `/users`: Bulk upload users.

## Question Processing API
**Base URL**: `/api/v1/question-processing`

*(Based on `questionProcessingRouter`)*
*   **POST** `/process`: Process raw questions.
*   **GET** `/status/:id`: Check processing status.
