# Question API Documentation

**Base URL**: `/api/v1/question`

## General Endpoints

### 1. Get Question Explanation
Gets the explanation for a specific question.
*   **URL**: `/getquestionexplanation`
*   **Method**: `GET`
*   **Query**: `questionid`
*   **Response**: Explanation data.

## Admin Endpoints
**Middleware**: `isAdmin`

### 2. Create Question
Creates a new question.
*   **URL**: `/admin/create`
*   **Method**: `POST`
*   **Body**: JSON object matching `questionInputZodSchema`.
*   **Response**: Success message.

### 3. Get Question
Gets a question by ID (Admin view?).
*   **URL**: `/:id`
*   **Method**: `GET`
*   **Response**: Question object.

### 4. Get Question All Data
Gets all data for a question by ID.
*   **URL**: `/alldata/:id`
*   **Method**: `GET`
*   **Response**: Question object details.

### 5. Get All Questions
Fetches all questions with filtering options.
*   **URL**: `/admin/allquestions`
*   **Method**: `GET`
*   **Query**: Filter parameters (check `QuestionFilterDataFetchZodSchema`).
*   **Response**: List of questions.

### 6. Update Question
Updates an existing question.
*   **URL**: `/admin/update`
*   **Method**: `PUT`
*   **Body**: JSON object matching `questionUpdateZodSchema`.
*   **Response**: Success message.
