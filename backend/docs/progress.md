# Progress Tracking Service

## Overview
The Progress Service tracks user engagement with study materials (Notes) and gamifies the experience through Activity Logs. It also calculates syllabus coverage statistics.

## Database Models

### `UserTopicProgress` (New)
Tracks the state of a user reading a specific topic.
*   `userId`: FK to User
*   `topicId`: FK to Topic
*   `timeSpent`: Total seconds spent reading.
*   `status`: enum `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
*   `lastReadAt`: Timestamp of last interaction.

### `UserActivity` (Reference)
Immutable log of events. Used for streaks and XP.
*   `type`: `CHAPTER` (used when a topic is completed)

## API Endpoints

### 1. Track Progress (Heartbeat)
*   **POST** `/api/v1/progress/track`
*   **Auth**: Required
*   **Body**:
    ```json
    {
      "topicId": "string",
      "timeSpentDelta": 30
    }
    ```
*   **Behavior**: Increments `timeSpent`, updates `lastReadAt`. Sets status to `IN_PROGRESS` automatically.

### 2. Mark as Complete
*   **PUT** `/api/v1/progress/status`
*   **Auth**: Required
*   **Body**:
    ```json
    {
      "topicId": "string",
      "status": "COMPLETED"
    }
    ```
*   **Behavior**: Sets status to `COMPLETED`. Should trigger a `UserActivity` log (planned/optional).

### 3. Get Syllabus Stats
*   **GET** `/api/v1/progress/syllabus/:examYearId`
*   **Auth**: Required
*   **Response**:
    ```json
    {
      "success": true,
      "data": {
        "totalProgress": 45.5,
        "subjects": [
          {
            "subjectId": "...",
            "name": "Physics",
            "progress": 30.0,
            "totalTopics": 20,
            "completedTopics": 6
          }
        ]
      }
    }
    ```

## Usage Flow
See `progress_activity_flow.md` for a detailed sequence diagram.
