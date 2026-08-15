# Quiz API & Live Engine Documentation

**Base URL**: `/api/v1/quiz`

---

## 🔌 API Endpoints

### 1. Create User Quiz
Creates a new quiz session for the user.
*   **URL**: `/user/create`
*   **Method**: `POST`
*   **Body**: JSON object matching `activity_quiz_create_zod_schema`.
*   **Response**: Created quiz metadata object containing `id`, `total_questions`, `nextQuestionTime`, etc.

### 2. Get Available Quizzes
Gets a list of active quizzes available to participate in.
*   **URL**: `/available`
*   **Method**: `GET`
*   **Response**: Array of active `QuizMetaData` objects retrieved from Redis (`quiz:meta:*`).

### 3. Get Quiz Config (Telegram / Bot)
Fetches quiz configuration parameters for a specific chat room or Telegram group.
*   **URL**: `/config/:chatId`
*   **Method**: `GET`
*   **Response**: `BotQuizConfig` object (`total_questions`, `topics`, `is_multiple_answers`, `next_question_time`, `quiz_open_for`).

---

## 💾 Redis Caching & Standardized Key Specifications

The Quiz Engine relies heavily on Redis for high-speed live question delivery, option shuffling, and leaderboard tracking.

```
quiz:meta:{quizId}                        -> Quiz metadata object (JSON)
quiz:questions:{quizId}:{part}:{number}    -> Shuffled question payload with map (JSON)
quiz:submissions:{quizId}:{userId}        -> User submissions hash (field: number)
quiz:users:{quizId}                       -> Registered users set
quiz:leaderboard:{quizId}                 -> Real-time scores (ZSET)
```

| Key | Data Type | Description | Expiration / TTL |
| :--- | :--- | :--- | :--- |
| `quiz:meta:{quizId}` | `STRING` (JSON) | Quiz metadata (`QuizMetaData`). | Configurable (default 24h, final cleanup 300s) |
| `quiz:questions:{quizId}:{part}:{number}` | `STRING` (JSON) | Question payload formatted for UI (`exam_question_format_type`). | 24 Hours (86400s) |
| `quiz:submissions:{quizId}:{userId}` | `HASH` | User answer submissions (`questionNumber` -> submission JSON). | 24 Hours (86400s) |
| `quiz:users:{quizId}` | `SET` | Active quiz participants. | 24 Hours (86400s) |
| `quiz:leaderboard:{quizId}` | `ZSET` | Real-time leaderboard score ranking. | 24 Hours (86400s) |

---

## ⚙ Background Worker Processing

### 1. `QuizCreateTask`
- Triggered when a new quiz is requested.
- Fetches candidate questions based on subject/topic filters.
- Formats questions and shuffles options using `shuffleArraySeeded`, storing an option map array (`map`) inside each question object.
- Pipelined to Redis under `quiz:meta:{quizId}` and `quiz:questions:{quizId}:{part}:{number}`.

### 2. `QuizAnsTask`
- Receives user submission payload: `{ quizId, userId, userans, number, isMultiple, timestamp }`.
- Retrieves question from `quiz:questions:{quizId}:part1:{number}`.
- Maps user selected option indices back to original option indices using `question.question.map`.
- Verifies correctness against correct answer array `correctAnsArray`.
- Stores submission in `quiz:submissions:{quizId}:{userId}`.
- Updates score in `quiz:leaderboard:{quizId}` via `LeaderboardManager`.
- Publishes updated leaderboard message `{ type: "QUIZ_LEADERBOARD", payload: { leaderboard }, rooms: [quizId] }` to Redis Pub/Sub channel `WS_BROADCAST`.

---

## ⚠️ Deprecations & Migration
- **Deprecated Redis Keys**:
  - `quiz:data:{quizId}` replaced by `quiz:meta:{quizId}`.
  - `quizquestion:{quizId}:{part}:{number}` replaced by `quiz:questions:{quizId}:{part}:{number}`.
- **Type Field Standard**:
  - Field `allows_multiple_answers` renamed/standardized to `is_multiple_ans` across all task workers and Telegram Bot providers.
