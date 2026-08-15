# Exam Buddy Backend (`exam_server`)

Welcome to the **Exam Buddy Backend Server** repository. This project provides a robust, domain-driven REST API, live quiz engine, caching system, and background event processor supporting the Exam Buddy educational platform.

---

## 🏛 System Architecture & Modular Design

The codebase follows a **Domain-Driven Modular Architecture**. All core feature sets are decoupled into isolated domain modules inside `src/app/{domain}/`.

```mermaid
graph TD
    Client[Client / Web / Mobile] -->|HTTP / REST| Express[Express Server - src/server.ts]
    Express --> AuthMiddleware[Auth & Security - src/lib/security]
    Express --> AppModules[App Domain Modules - src/app/*]
    
    subgraph App Domains (src/app/)
        AppModules --> User[user]
        AppModules --> Exam[exam]
        AppModules --> Quiz[quiz]
        AppModules --> Payment[payment]
        AppModules --> Progress[progress]
        AppModules --> Note[note & syllabus]
        AppModules --> OtherDomains[activity, bot, category, etc.]
    end

    AppModules --> Drizzle[Drizzle ORM - src/db/schema.ts]
    Drizzle --> Postgres[(PostgreSQL Database)]

    AppModules --> Managers[Singletons - src/lib/manager]
    Managers --> Redis[(Redis Cache & Pub/Sub)]
    
    Express --> EventEngine[Event Engine - src/lib/event]
    EventEngine --> EventStrategies[Event Strategies]
    EventStrategies --> BullMQ[Worker Queue - BullMQ]
```

### Modular Directory Layout (`src/app/{domain}/`)
Each domain module standardizes its component layout:
- `schema.ts`: Database table and relation definitions for the domain.
- `service.ts`: Business logic and database operations.
- `controller.ts`: Request handling, parameter parsing, and response formatting.
- `route.ts`: Express route declarations and middleware attachment.

---

## 💾 Database Schema & ORM Architecture

The platform uses **Drizzle ORM** with PostgreSQL.

### Schema Aggregation
Individual domain schemas are defined within their respective domain folders (`src/app/{domain}/schema.ts`) and re-exported centrally via [`src/db/schema.ts`](file:///p:/Project/exambuddys/exam_server/src/db/schema.ts):

```typescript
// src/db/schema.ts
export * from "./enums.js";
export * from "./telegram.js";
export * from "./relations.js";

export * from "../app/activity/schema.js";
export * from "../app/bot/schema.js";
export * from "../app/category/schema.js";
export * from "../app/coupon/schema.js";
export * from "../app/event/schema.js";
export * from "../app/exam/schema.js";
export * from "../app/issue/schema.js";
export * from "../app/metrix/schema.js";
export * from "../app/note/schema.js";
export * from "../app/offer/schema.js";
export * from "../app/payment/schema.js";
export * from "../app/progress/schema.js";
export * from "../app/question/schema.js";
export * from "../app/quiz/schema.js";
export * from "../app/subscription/schema.js";
export * from "../app/syllabus/schema.js";
export * from "../app/user/schema.js";
```

---

## ⚡ Redis Caching & Standardized Key Specifications

Redis is used for live quiz execution, leaderboard management, user session tokens, and pub/sub messaging.

| Key Pattern | Data Type | Description | TTL / Expiration |
| :--- | :--- | :--- | :--- |
| `quiz:meta:{quizId}` | `STRING` (JSON) | Metadata for active quiz (`QuizMetaData`). | Configurable (default 24h, final cleanup 300s) |
| `quiz:questions:{quizId}:{part}:{number}` | `STRING` (JSON) | Formatted question payload with shuffled option mapping (`exam_question_format_type`). | 24 Hours (86400s) |
| `quiz:submissions:{quizId}:{userId}` | `HASH` | User question submission results (field: `number`, value: submission JSON). | 24 Hours (86400s) |
| `quiz:users:{quizId}` | `SET` | Set of user IDs registered or participating in the quiz. | 24 Hours (86400s) |
| `quiz:leaderboard:{quizId}` | `ZSET` | Real-time quiz leaderboard (member: `userId`, score: points). | 24 Hours (86400s) |
| `leaderboard:global` | `ZSET` | Platform-wide global activity leaderboard. | Persistent / Daily Archive |
| `WS_BROADCAST` | `Pub/Sub Channel` | Real-time channel for broadcasting live quiz leaderboards & updates. | N/A |

---

## ⚙ Background Processing & Event Engine

The application leverages `@subhajit60/event-engine` and BullMQ background workers:

### Event Strategies ([`src/lib/event/event_statergis/`](file:///p:/Project/exambuddys/exam_server/src/lib/event/event_statergis/))
- `create_exam_event`: Handles automated exam generation and question allocation.
- `create_dpp_event`: Asynchronously generates Daily Practice Problems.
- `activity-leaderboard-event`: Flushes daily Redis global leaderboards into the `activity_leaderboards` PostgreSQL table.
- `send-notification-event`: Dispatches notifications via Email and Telegram.

### Cron Jobs ([`src/lib/event/jobs/`](file:///p:/Project/exambuddys/exam_server/src/lib/event/jobs/))
- `activity.cron.ts`: Triggers daily streak, challenge, and leaderboard resets.
- `stats.cron.ts`: Periodically compiles platform activity statistics.

---

## 🔌 Core API Modules

For detailed endpoint documentation, see the files in the [`docs/`](file:///p:/Project/exambuddys/exam_server/docs/) directory:

- [Admin & Event API](file:///p:/Project/exambuddys/exam_server/docs/admin.md)
- [Bot Configuration API](file:///p:/Project/exambuddys/exam_server/docs/bot_config.md)
- [Exam & Test Series API](file:///p:/Project/exambuddys/exam_server/docs/exam.md)
- [Mock Exam API](file:///p:/Project/exambuddys/exam_server/docs/mock.md)
- [Note & Topic API](file:///p:/Project/exambuddys/exam_server/docs/note.md)
- [Progress Tracking API](file:///p:/Project/exambuddys/exam_server/docs/progress.md)
- [Question Processing API](file:///p:/Project/exambuddys/exam_server/docs/question.md)
- [Quiz API & Live Engine](file:///p:/Project/exambuddys/exam_server/docs/quiz.md)
- [Syllabus API](file:///p:/Project/exambuddys/exam_server/docs/syllabus.md)
- [User & Authentication API](file:///p:/Project/exambuddys/exam_server/docs/user.md)

---

## 🛠 Environment & Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/exambuddys
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Running Locally
```bash
# Install dependencies
npm install

# Run TypeScript compilation check
cmd /c npx tsc --noEmit

# Start development server
npm run dev
```

---

## ⚠️ Breaking Changes & Migration Notes

1. **Legacy Directories Deprecated**:
   - `src/controllers/`, `src/routes/`, and `src/services/` have been removed.
   - All handlers must be accessed via their corresponding `src/app/{domain}/` module.
2. **Schema Import Standard**:
   - Importing schema tables from individual files like `@/db/user.js` or `@/db/exam.js` is **deprecated and unsupported**.
   - Always import schema tables from `@/db/schema.js` (or `@/db/schema`).
3. **Redis Key Format Standard**:
   - Replaced legacy `quiz:data:{quizId}` with `quiz:meta:{quizId}`.
   - Replaced legacy `quizquestion:{quizId}:{part}:{number}` with `quiz:questions:{quizId}:{part}:{number}`.
4. **ORM Standard**:
   - Prisma has been completely replaced with Drizzle ORM.
