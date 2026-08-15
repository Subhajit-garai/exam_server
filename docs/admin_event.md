# Admin Event Management API

## Base URL
`/api/v1/event` or `/api/admin/event`  
**Middleware**: `isAdmin`

---

## 🔌 Endpoints

### 1. List All Events
*   **URL**: `/all`
*   **Method**: `GET`
*   **Response**: Array of Event objects.

### 2. Create Event
*   **URL**: `/create`
*   **Method**: `POST`
*   **Body**: `EventFormData` (matching `event_create_zod_schema`)
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

---

## ⚙ Event Strategies & Engine Integration

Events are executed asynchronously via the Event Engine ([`src/lib/event/index.js`](file:///p:/Project/exambuddys/exam_server/src/lib/event/index.ts)) using strategy classes in [`src/lib/event/event_statergis/`](file:///p:/Project/exambuddys/exam_server/src/lib/event/event_statergis/):

| Event Type | Strategy File | Description |
| :--- | :--- | :--- |
| `CREATE_EXAM` | `create-exam-event.ts` | Triggers background exam generation and question allocation. |
| `CREATE_DPP` | `create-dpp-event.ts` | Generates Daily Practice Problem (DPP) sets automatically. |
| `RUN_TELEGRAM_QUIZ` | `quiz/run-telegram-quiz-event.ts` | Dispatches scheduled Telegram bot quiz tasks. |
| `RUN_WEBAPP_QUIZ` | `quiz/run-webapp-quiz-event.ts` | Initializes web app live quiz instances. |
| `ACTIVITY_LEADERBOARD_ARCHIVE` | `activity-leaderboard-event.ts` | Flushes daily Redis leaderboards to PostgreSQL. |
| `SEND_MESSAGE` | `send-notification-event.ts` | Dispatches multi-channel user notifications (Email/Telegram). |

---

## ⚠️ Deprecations & Migration
- **Module Relocation**: Event handlers moved to [`src/app/event/`](file:///p:/Project/exambuddys/exam_server/src/app/event/).
- **Schema Imports**: Use `import { events } from "@/db/schema.js";`.
