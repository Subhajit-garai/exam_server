# Backend API Requirements & Domain Specs

This document defines the REST API requirements for key user dashboard features, including the User Activity Heatmap and Topic Progress Tracking.

---

## 1. Activity Heatmap

**Endpoint:** `GET /api/v1/activity/heatmap` (or `/user/activity/heatmap`)  
**Middleware:** `userauthenticate`

**Description:** Returns daily activity metrics and computed intensity levels over the past year for rendering user contribution heatmaps.

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-08-01",
      "count": 5,
      "level": 2
    },
    {
      "date": "2026-08-02",
      "count": 0,
      "level": 0
    }
  ]
}
```

**Fields:**
- `date`: String (YYYY-MM-DD). Date of recorded activity.
- `count`: Number. Total count of actions (questions attempted, notes created, etc.) on that date.
- `level`: Number (0-4). Intensity index for styling heatmap cells (0 = no activity, 4 = peak activity).

---

## 2. User Topics Progress

**Endpoint:** `GET /api/v1/progress/user/topics`  
**Middleware:** `userauthenticate`

**Description:** Returns a detailed list of topic progress tracking metrics for the authenticated user.

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
    }
  ]
}
```

**Fields:**
- `topicId`: String. Unique identifier for the topic.
- `topicName`: String. Topic title.
- `percentage`: Number (0-100). Overall topic completion percentage.
- `timeSpent`: Number. Accumulated time spent in seconds.
- `status`: String (`STARTED`, `IN_PROGRESS`, `COMPLETED`).

---

## 💾 Implementation Notes
- Implemented in domain modules [`src/app/activity/`](file:///p:/Project/exambuddys/exam_server/src/app/activity/) and [`src/app/progress/`](file:///p:/Project/exambuddys/exam_server/src/app/progress/).
- All schema entity imports use `@/db/schema.js`.
