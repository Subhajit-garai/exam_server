# Admin Event Management API

## Base URL
`/api/admin/event`
**Middleware**: `isAdmin`

## Endpoints

### 1. List All Events
*   **URL**: `/all`
*   **Method**: `GET`
*   **Response**: Array of Event objects.

### 2. Create Event
*   **URL**: `/create`
*   **Method**: `POST`
*   **Body**: `EventFormData` (See Types)
*   **Response**: Created Event object.

### 3. Update Event
*   **URL**: `/update/:id`
*   **Method**: `PUT`
*   **Params**: `id` (Event ID)
*   **Body**: Partial `EventFormData`
*   **Response**: Updated Event object.

### 4. Delete Event
*   **URL**: `/delete/:id`
*   **Method**: `DELETE`
*   **Params**: `id` (Event ID)
*   **Response**: Success message.

## Data Types

### Event Types
*   `RUN_NEW_QUIZ`
*   `CREATE_QUIZ_CONTEST`
*   `SEND_MESSAGE`
*   `CREATE_DPP`
*   `CREATE_EXAM`
*   `CLEAR_BOT_CACHE`
*   `ACTIVITY_LEADERBOARD_ARCHIVE`

### Event Payload Structure
Payload depends on `type`.
*   **CREATE_EXAM**: `{ starttime: [], count, title, examname, category, ... }`
*   **SEND_MESSAGE**: `{ to: string, message: string }`
