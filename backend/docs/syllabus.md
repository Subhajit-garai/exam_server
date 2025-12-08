# Syllabus & Category API Documentation

## Syllabus API
**Base URL**: `/api/v1/syllabus`

### General Endpoints

#### 1. Get Formatted Syllabus
Gets the syllabus in a formatted way.
*   **URL**: `/get/formated`
*   **Method**: `GET`
*   **Response**: Formatted syllabus data.

#### 2. Get Syllabus By ID
Gets a syllabus by ID.
*   **URL**: `/get/syllabus/id`
*   **Method**: `GET`
*   **Query**: `id`
*   **Response**: Syllabus details.

### Admin Endpoints
**Middleware**: `isAdmin`

#### 3. Get All Syllabus
Fetches all syllabi.
*   **URL**: `/get/all` (and `/name/get/all`)
*   **Method**: `GET`
*   **Response**: List of syllabi.

#### 4. Get Syllabus ID (List?)
Fetched all syllabus IDs?
*   **URL**: `/get/id`
*   **Method**: `GET`

#### 5. Get Syllabus By Exam Year
Fetches syllabus for a specific exam year?
*   **URL**: `/get/examyearid`
*   **Method**: `GET`

#### 6. Create Syllabus
Creates a new syllabus.
*   **URL**: `/admin/create`
*   **Method**: `POST`
*   **Body**: Syllabus details.

#### 7. Delete Syllabus
Deletes a syllabus.
*   **URL**: `/admin/delete`
*   **Method**: `DELETE`

#### 8. Add Subject
Adds a subject to a syllabus.
*   **URL**: `/admin/add/subject`
*   **Method**: `POST`

#### 9. Remove Subject
Removes a subject from a syllabus.
*   **URL**: `/admin/remove/subject`
*   **Method**: `DELETE`

#### 10. Add Topic
Adds a topic to a syllabus subject.
*   **URL**: `/admin/add/topic`
*   **Method**: `POST`

#### 11. Remove Topic
Removes a topic from a syllabus subject.
*   **URL**: `/admin/remove/topic`
*   **Method**: `DELETE`

---

## Category API (Admin)
**Base URL**: `/api/v1/admin/category`

### Endpoints
**Middleware**: `isAdmin`

#### 1. Create Category
Creates a new category.
*   **URL**: `/create`
*   **Method**: `POST`
*   **Body**: Category details.

#### 2. Get Category By ID
Gets a category by ID.
*   **URL**: `/:id`
*   **Method**: `GET`
*   **Response**: Category details.

#### 3. Update Category
Updates a category.
*   **URL**: `/update/:id`
*   **Method**: `PUT`
*   **Body**: Update details.

#### 4. Delete Category
Deletes a category.
*   **URL**: `/delete/:id`
*   **Method**: `DELETE`
