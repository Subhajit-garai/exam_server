# Admin & Bot API Documentation

**Base URL**: `/api/v1/admin`

## Admin General Endpoints
**Middleware**: `isAdmin`

### 1. Update App Config
Updates application configuration settings.
*   **URL**: `/settings/update/appconfig`
*   **Method**: `PUT`
*   **Body**: Config object.

### 2. Get App Config
Retrieves application configuration.
*   **URL**: `/settings/get/appconfig`
*   **Method**: `GET`
*   **Response**: Config object.

### 3. Get All Bot Users
Gets all bot users.
*   **URL**: `/bot/get/all`
*   **Method**: `GET`
*   **Response**: List of bot users.

### 4. Set Quiz Topic
Sets the quiz topic (for bot?).
*   **URL**: `/setquiztopic`
*   **Method**: `POST`

### 5. Set Bot Token
Adds a bot token.
*   **URL**: `/setToken`
*   **Method**: `POST`

### 6. Create New Bot
Creates a new bot instance.
*   **URL**: `/bot/create`
*   **Method**: `POST`

### 7. Update Bot Webhook
Updates the webhook URL for a bot.
*   **URL**: `/bot/botWebhook`
*   **Method**: `PUT`

---

## Bot API
**Base URL**: `/api/v1/bot`
**Middleware**: `botauthenticate`

### Auth & System
*   **GET** `/auth`: Validate bot token.
*   **POST** `/login`: Bot login.

### User Management (Bot Context)
*   **POST** `/user/progress/set`: Set user progress.
*   **POST** `/user/score/set`: Set user score.
*   **GET** `/user/score/get`: Get user score.
*   **POST** `/user/ans/set`: Set user answers.
*   **GET** `/user/ans/get`: Get user answers.

### Exam & Pattern
*   **GET** `/exam/patternid/get/:examid`: Get exam pattern ID.
*   **GET** `/exam/update/creation/status/:examid`: Update exam creation status.
*   **GET** `/exampattern/get/:exampatternid`: Get exam pattern details.
*   **GET** `/exam/details/get/:examid`: Get exam details.
*   **GET** `/mock/exampattern/details/get`: Get mock set pattern details.
*   **GET** `/exam/questions/add/status/:examid`: Check question addition status.

### Syllabus
*   **GET** `/syllabus/exam/get`: Get syllabus for exam creation.

### Questions
*   **POST** `/question/processing/get`: Get questions for processing.
*   **POST** `/question/processed/add`: Add processed questions.
*   **GET** `/questions/info/get`: Get question info.
*   **GET** `/questions/ans/get/:examid`: Get correct answers for exam.
*   **GET** `/questions/ids`: Get question IDs.
*   **GET** `/questions/get`: Get questions.
*   **POST** `/questions/get/byids`: Get questions by IDs.
*   **POST** `/questions/add/:examid`: Add questions to exam.

### Quiz
*   **GET** `/getquiztopic`: Get quiz topic.
*   **GET** `/get/quiz/config`: Get quiz config.
*   **POST** `/getquestionsset`: Send quiz data.
*   **GET** `/isprimeuser`: Check if user is prime.
*   **GET** `/allusers`: Get all users.

### Telegram Group Integration
*   **GET** `/group/info`: Get group info.
*   **GET** `/group/topic/info/get`: Get group topic info.
*   **GET** `/validchatids`: Get valid chat IDs.
*   **GET** `/isgroupjoinable`: Check if group is joinable.
*   **GET** `/getusersdata`: Get user data.
*   **POST** `/notification`: Process notification.
