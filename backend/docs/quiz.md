# Quiz API Documentation

**Base URL**: `/api/v1/quiz`

## Endpoints

### 1. Create User Quiz
Creates a new quiz for the user.
*   **URL**: `/user/create`
*   **Method**: `POST`
*   **Body**: JSON object matching `create_quiz_data_ZodSchema` (via `req.body`).
*   **Response**: Created quiz object.

### 2. Get Available Quizzes
Gets a list of available quizzes.
*   **URL**: `/available`
*   **Method**: `GET`
*   **Response**: List of quizzes.
