# Bot Quiz Configuration API

## Base URL
`/api/v1/bot` or `/api/admin/quizconfig`
**Middleware**: `isAdmin` / `userauthenticate`

---

## 🔌 Endpoints

### 1. List Configs
*   **URL**: `/`
*   **Method**: `GET`
*   **Response**: Array of `bot_quiz_configs` objects.

### 2. Create Config
*   **URL**: `/`
*   **Method**: `POST`
*   **Body**: `BotQuizConfigForm`
*   **Response**: Created `bot_quiz_configs` record.

### 3. Get Config Details
*   **URL**: `/:id`
*   **Method**: `GET`
*   **Response**: Single `bot_quiz_configs` record.

### 4. Update Config
*   **URL**: `/:id`
*   **Method**: `PUT`
*   **Body**: Partial `BotQuizConfigForm`
*   **Response**: Updated `bot_quiz_configs` record.

### 5. Delete Config
*   **URL**: `/:id`
*   **Method**: `DELETE`
*   **Response**: Success message.

---

## 💾 Data Model (Drizzle ORM)

Located in [`src/app/bot/schema.ts`](file:///p:/Project/exambuddys/exam_server/src/app/bot/schema.ts) (re-exported via [`src/db/schema.ts`](file:///p:/Project/exambuddys/exam_server/src/db/schema.ts)):

```typescript
export const bot_quiz_configs = pgTable("bot_quiz_configs", {
  id: text("id").primaryKey().$defaultFn(() => cuid()),
  chat_id: text("chat_id").notNull().unique(),
  topics: text("topics").array().notNull().default([]),
  total_questions: integer("total_questions").notNull().default(10),
  is_multiple_answers: boolean("is_multiple_answers").notNull().default(false),
  next_question_time: integer("next_question_time").notNull().default(60),
  quiz_open_for: integer("quiz_open_for").notNull().default(24),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
});
```

*   `chat_id`: Target Telegram group or channel chat ID.
*   `topics`: Array of subject topic strings selected for automated quizzes.
*   `total_questions`: Number of questions sent per quiz run.
*   `is_multiple_answers`: Enables multiple choice answers.
*   `next_question_time`: Delay between question dispatches (seconds).
*   `quiz_open_for`: Duration in hours that the quiz session remains active in cache.

---

## ⚠️ Deprecations & Migration
- **Prisma Schema Deprecated**: Replaced with Drizzle ORM table `bot_quiz_configs`.
- **Import Path**: Import via `import { bot_quiz_configs } from "@/db/schema.js";`.
