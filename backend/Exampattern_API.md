# Exam Pattern API Documentation

This document outlines the API paths and data structures for the Exam Pattern CRUD operations.

## Base URL
`/api/v1/exam`

## Data Structures

### ExamPattern (Response Object)
The structure of the Exam Pattern object returned by the API.

```typescript
interface ExamPattern {
  id: string;
  title: string | null;
  format: "Text" | "Image"; // Default: "Text"
  examname: string;
  categoryId: string | null;
  syllabus: "Syllabus" | "Generic"; // Default: "Syllabus"
  syllabusid: string | null;
  topics: string[];
  difficulty: "Easy" | "Medium" | "Hard"; // Default: "Easy"
  part: boolean | null;
  checkbox: boolean | null;
  part_Count: number; // Default: 1
  total_questions: number[];
  check: "Normal" | "Hybrid" | null; 
  marks_values: number[];
  neg_values: number[];
  is_multiple_ans: number[]; // e.g., [0, 0]
  created_by: string;
}
```

## API Endpoints

### 1. Create Exam Pattern
Creates a new exam pattern.

- **URL**: `/admin/createpattern`
- **Method**: `POST`
- **Protected**: Yes (Admin only)
- **Request Body**:

```typescript
{
  title: string;
  format: "Text" | "Image";
  examname: string;
  examyear: string; // Used to look up syllabus if checkbox is true
  syllabus?: string; // Information string, required if checkbox is true
  category: string;
  topics?: string[]; // Required if checkbox is false
  difficulty: "Easy" | "Medium" | "Hard";
  part: boolean;
  checkbox: boolean; // If true, uses syllabus. If false, uses list of topics.
  part_Count: number;
  total_questions: number[];
  check: "Normal" | "Hybrid";
  marks_values: number[];
  neg_values: number[];
}
```

- **Success Response**:
```json
{
  "success": true,
  "message": "New Exam Pattern Created Successful"
}
```

### 2. Get Exam Pattern by ID
Fetches a specific exam pattern by its ID.

- **URL**: `/admin/pattern/get/:id`
- **Method**: `GET`
- **Protected**: Yes (Admin only)
- **Response**:

```json
{
  "success": true,
  "message": "Exam Pattern fetched successfully",
  "data": {
    // ... ExamPattern object
  }
}
```

### 3. Update Exam Pattern
Updates an existing exam pattern.

- **URL**: `/admin/pattern/update`
- **Method**: `PUT`
- **Protected**: Yes (Admin only)
- **Request Body**:
  - Accepts a subset of the Create body fields locally + `id`.
  - Basically `Partial<CreateBody> & { id: string }`.

```typescript
{
  id: string;
  // ... any fields from Create Pattern body to update
}
```

- **Response**:
```json
{
  "success": true,
  "message": "Exam Pattern updated successfully",
  "data": {
     // ... Updated ExamPattern object
  }
}
```

### 4. Delete Exam Pattern
Deletes an exam pattern by its ID.

- **URL**: `/admin/pattern/delete/:id`
- **Method**: `DELETE`
- **Protected**: Yes (Admin only)
- **Response**:

```json
{
  "success": true,
  "message": "Exam Pattern deleted successfully",
  "data": {
      "count": 1 // Number of records deleted
  }
}
```

### 5. Get Available Exam Patterns (For Public/User)
Fetches available exam patterns for a specific exam name created by the user (or generally available, logic depends on backend implementation but strictly filters by `created_by` in current service logic).

- **URL**: `/avalibleExamPattern`
- **Method**: `GET`
- **Params**:
    - `exam`: string (Query param, e.g., `?exam=GATE`)
- **Response**:

```json
{
  "success": true,
  "message": "alalible Exam patterns",
  "data": [
    {
      "id": "...",
      "title": "..."
    },
    // ...
  ]
}
```
