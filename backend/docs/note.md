# Note API Documentation

**Base URL**: `/api/v1/notes`

## General Endpoints

### 1. Get Note Content
Retrieves the content of a specific note/topic.
*   **URL**: `/getnote/:subject/:topic`
*   **Method**: `GET`
*   **Params**: `subject` (slug?), `topic` (slug?)
*   **Response**: Note content.

### 2. Get Topic Details
Retrieves details of a specific topic by ID.
*   **URL**: `/gettopic`
*   **Method**: `GET`
*   **Query**: `topicid`
*   **Response**: Topic details.

### 3. Get All Subjects (By Exam)
Gets all subjects associated with an exam.
*   **URL**: `/allsubject`
*   **Method**: `GET`
*   **Query**: `exam`
*   **Response**: List of subjects.

### 4. Get All Topics (By Subject)
Gets all topics for a specific subject (slug).
*   **URL**: `/alltopic/:slug`
*   **Method**: `GET`
*   **Params**: `slug` (subject slug)
*   **Response**: List of topics.

### 5. Like Topic
Adds a like to a topic.
*   **URL**: `/like` (Wait, param needed? Controller uses `req.params.subject` / `topic` but route is `/like`? Need to check route definition. Route: `noteRouter.post("/like", like)` -> Controller expects params? Route definition might be missing params `:subject/:topic` or uses body? Controller `req.params`. Route must match. Assuming route is incomplete or I missed it. Actually `noteRoute.ts` line 14: `post("/like", like)` no params. Controller line 22: `const { subject, topic } = req.params`. **Potential Bug**).

### 6. Dislike Topic
Adds a dislike to a topic.
*   **URL**: `/dislike` (Same issue as Like).

### 7. Read Count
(Route defined but no controller attached in `noteRoute.ts` line 16? `noteRouter.get("/readCount")` -> undefined handler? **Potential Bug**).

## Admin Endpoints
**Middleware**: `isAdmin` (for some)

### 8. Get Version List
Gets version history of a note.
*   **URL**: `/admin/getversionlist/:subject/:topic`
*   **Method**: `GET`
*   **Response**: Version list.

### 9. Create Subject
Creates a new subject.
*   **URL**: `/admin/subject/create`
*   **Method**: `POST`
*   **Body**: JSON object matching `createSubject_schema`.
*   **Response**: Creation status.

### 10. Delete Subject
Deletes a subject.
*   **URL**: `/admin/subject/delete`
*   **Method**: `DELETE`
*   **Query**: `id`
*   **Response**: Deletion status.

### 11. Create Topic
Creates a new topic.
*   **URL**: `/admin/topic/create`
*   **Method**: `POST`
*   **Body**: JSON object matching `createTopic_schema`.
*   **Response**: Creation status.

### 12. Delete Topic (Typo in Route?)
Deletes a topic.
*   **URL**: `/admin/topic/delete`
*   **Method**: `DELETE`
*   **Handler**: `CreateTopic` is attached in `noteRoute.ts` line 23! **Potential Bug**. Should be `DeleteTopic`.

### 13. Update Content
Updates content of a topic.
*   **URL**: `/admin/updatecontent`
*   **Method**: `PUT`
*   **Body**: JSON object matching `noteUpdate_schema`.
*   **Response**: Update status.
