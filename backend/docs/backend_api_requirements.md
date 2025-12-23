# Backend API Requirements

The following API endpoints need to be implemented in the backend to support the new User Profile Heatmap and Topic Progress features.

## 1. Activity Heatmap

**Endpoint:** `GET /user/activity/heatmap`

**Description:** Returns a list of daily activity intensity for the user over the past year (or relevant period).

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2023-01-01",
      "count": 5,
      "level": 2
    },
    {
      "date": "2023-01-02",
      "count": 0,
      "level": 0
    },
    ...
  ]
}
```

**Fields:**
- `date`: String (YYYY-MM-DD). The date of the activity.
- `count`: Number. The total number of activities (questions, notes, etc.) performed on that date.
- `level`: Number (0-4). The intensity level for coloring the heatmap cell (0 = no activity, 4 = high activity).

---

## 2. User Topics Progress

**Endpoint:** `GET /progress/user/topics`

**Description:** Returns a list of topics the user is currently working on or has started, along with their progress details.

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "topicId": "topic_123",
      "topicName": "Advanced Algebra",
      "percentage": 75,
      "timeSpent": 3600,
      "status": "IN_PROGRESS"
    },
    {
      "topicId": "topic_456",
      "topicName": "Newtonian Physics",
      "percentage": 100,
      "timeSpent": 5000,
      "status": "COMPLETED"
    },
    ...
  ]
}
```

**Fields:**
- `topicId`: String. Unique identifier for the topic.
- `topicName`: String. Display name of the topic.
- `percentage`: Number (0-100). Completion percentage.
- `timeSpent`: Number. Total time spent on this topic in seconds.
- `status`: String. Current status (e.g., "STARTED", "IN_PROGRESS", "COMPLETED").
