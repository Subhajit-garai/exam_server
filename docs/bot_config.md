# Bot Quiz Configuration API

## Base URL
`/api/admin/quizconfig`
**Middleware**: `isAdmin`

## Endpoints

### 1. List Configs
*   **URL**: `/`
*   **Method**: `GET`
*   **Response**: Array of `BotQuizConfig`.

### 2. Create Config
*   **URL**: `/`
*   **Method**: `POST`
*   **Body**: `BotQuizConfigForm`
*   **Response**: Created Config.

### 3. Get Config Details
*   **URL**: `/:id`
*   **Method**: `GET`
*   **Response**: Single `BotQuizConfig`.

### 4. Update Config
*   **URL**: `/:id`
*   **Method**: `PUT`
*   **Body**: Partial `BotQuizConfigForm`
*   **Response**: Updated Config.

### 5. Delete Config
*   **URL**: `/:id`
*   **Method**: `DELETE`
*   **Response**: Success message.

## Data Model (Prisma)
See `prisma/schema/bot.prisma` -> `botQuizConfig` model.
*   `chatId`: Target Telegram/Discord group ID.
*   `platform`: `TELEGRAM`, `DISCORD`.
*   `topics`: Array of topic strings.
*   `marks_values`, `neg_values`: Scoring rules.
*   `quizOpenFor`: Duration in minutes.
