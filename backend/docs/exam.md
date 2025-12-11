# Exam API Documentation

**Base URL**: `/api/v1/exam`

## General Endpoints

### 1. Token System / Service Charge
Gets the service charge or token info (?).
*   **URL**: `/tokensystem`
*   **Method**: `GET`
*   **Query**: `type` (optional)
*   **Response**: Service charge info.

### 2. Get Category Names
Gets available exam categories (names only).
*   **URL**: `/category/name`
*   **Method**: `GET`
*   **Response**: List of category names.

### 3. Get Categories
Gets available exam categories (full objects).
*   **URL**: `/categorys`
*   **Method**: `GET`
*   **Response**: List of category objects.

### 4. Join Request Process (Checkout?)
Processes a request to join an exam (often involves checking balance/payment).
*   **URL**: `/joinrequest`
*   **Method**: `GET`
*   **Query**: `id` (Exam ID)
*   **Response**: Confirmation of join.

### 5. Get Exams
Fetches exams with optional filtering.
*   **URL**: `/getExams`
*   **Method**: `GET`
*   **Query**:
    *   `type` (optional): Filter by ExamType.
    *   `page`, `limit`, `order` (pagination/sort).
*   **Response**: List of exams.

### 6. Get Exam By ID
Fetches a specific exam by ID.
*   **URL**: `/getexambyid`
*   **Method**: `GET`
*   **Query**: `id`
*   **Response**: Exam details.

### 7. Get Joined Exam Data (Questions)
Fetches questions for an exam the user has joined (and is currently taking?).
*   **URL**: `/data`
*   **Method**: `GET`
*   **Query**: `examid`, `type`, `number`, `part`
*   **Response**: Question data.

### 8. Submit Answer
Submits an answer for a specific question.
*   **URL**: `/submitans`
*   **Method**: `GET` (Note: Should ideally be POST)
*   **Query**: `examid`, `number`, `part`, `ans`, `ismultiple`
*   **Response**: Status.

### 9. Final Submit
Submits the entire exam.
*   **URL**: `/finalsubmit`
*   **Method**: `GET` (Note: Should ideally be POST)
*   **Query**: `examid`
*   **Response**: Completion status.

### 10. Get Exam Year Info
Gets info about exam years (e.g., PYQ years).
*   **URL**: `/year/get`
*   **Method**: `GET`
*   **Query**: `examname`, `id`
*   **Response**: Exam year details.

## Admin Endpoints
**Middleware**: `isAdmin`

### 11. Delete Exams
Deletes exams (bulk or specific? - check implementation).
*   **URL**: `/deletexams`
*   **Method**: `GET` (Note: Should be DELETE)
*   **Response**: Deletion status.

### 12. Available Targeted Exams
Gets available targeted exams (filter by category?).
*   **URL**: `/avalible/targeted/exam`
*   **Method**: `GET`
*   **Query**: `category`
*   **Response**: List of targeted exams.

### 13. All Available Targeted Exams
Gets all targeted exams.
*   **URL**: `/avalible/targeted/exam/all`
*   **Method**: `GET`
*   **Response**: List of targeted exams.

### 14. Available Exam Patterns
Gets exam patterns for a specific exam type.
*   **URL**: `/avalibleExamPattern`
*   **Method**: `GET`
*   **Query**: `exam` (name, e.g., 'GATE')
*   **Response**: List of patterns.

### 15. Create Exam Pattern
Creates a new exam pattern.
*   **URL**: `/createpattern`
*   **Method**: `POST`
*   **Body**: Pattern details.

### 16. Create Exam
Creates a new exam.
*   **URL**: `/create`
*   **Method**: `POST`
*   **Body**: Exam details `create_targated_exam_zodSchemea` (check naming).

### 17. Get Target Exam By ID
Fetches target exam by ID via POST.
*   **URL**: `/get/target/exam/id`
*   **Method**: `POST`
*   **Body**: `{ "id": "..." }` (check logic, usually query).

### 18. Create Target Exam
Creates a new target exam.
*   **URL**: `/create/target/exam`
*   **Method**: `POST`
*   **Body**: Target exam details.

### 19. Create Target Exam Year
Creates a year entry for a target exam.
*   **URL**: `/create/target/examyear`
*   **Method**: `POST`
*   **Body**: Year details.

### 20. Update Target Exam Year
Updates target exam year info.
*   **URL**: `/update/target/examyear/info`
*   **Method**: `PUT`
*   **Body**: Update details.

## User Metadata & Data

### 21. User Metadata for Exam
Gets user's rank, score, etc. for an exam.
*   **URL**: `/usermetadataforanexam`
*   **Method**: `GET`
*   **Query**: `examid`
*   **Response**: User metadata (rank, score, topper score).

### 22. Exam Attempt Metadata
Gets metadata about user's attempt (not_attempt, total_questions).
*   **URL**: `/examattemptquestiondata`
*   **Method**: `GET`
*   **Query**: `examid`

### 23. Get User Answer Set
Gets the user's answers for an exam.
*   **URL**: `/getuseransset`
*   **Method**: `GET`
*   **Query**: `examid`
