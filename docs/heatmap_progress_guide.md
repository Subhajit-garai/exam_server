# Heatmap & Progress Bar Implementation Guide

This guide details how to implement a user activity heatmap and a topic progress bar using Drizzle ORM and the domain-driven module structure (`src/app/activity/` and `src/app/progress/`).

---

## 1. Activity Heatmap

**Goal**: Display a visual representation of user activity intensity over time (similar to GitHub contribution graph).

### Data Source
- **Table**: `user_activities` ([`src/app/activity/schema.ts`](file:///p:/Project/exambuddys/exam_server/src/app/activity/schema.ts), re-exported via [`src/db/schema.js`](file:///p:/Project/exambuddys/exam_server/src/db/schema.ts))
- **Fields**: `id`, `user_id`, `activity_type`, `points`, `created_at`

### Backend Implementation

#### Service Layer ([`src/app/activity/service.ts`](file:///p:/Project/exambuddys/exam_server/src/app/activity/service.ts))
Implementation using Drizzle ORM query builders:

```typescript
import { db } from "@/db/index.js";
import { user_activities } from "@/db/schema.js";
import { eq, sql, count } from "drizzle-orm";

export class ActivityService {
  /**
   * Get aggregated activity data for heatmap.
   * Returns an array of { date: string, count: number, level: number }
   */
  async getActivityHeatmap(userId: string) {
    const rawActivities = await db
      .select({
        date: sql<string>`DATE(${user_activities.created_at})`,
        count: count(user_activities.id),
      })
      .from(user_activities)
      .where(eq(user_activities.user_id, userId))
      .groupBy(sql`DATE(${user_activities.created_at})`)
      .orderBy(sql`DATE(${user_activities.created_at})`);

    return rawActivities.map((entry) => ({
      date: entry.date,
      count: Number(entry.count),
      level: this.calculateHeatmapLevel(Number(entry.count)),
    }));
  }

  private calculateHeatmapLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }
}
```

#### API Endpoint
Mounted in [`src/app/activity/route.ts`](file:///p:/Project/exambuddys/exam_server/src/app/activity/route.ts):
- **GET** `/api/v1/activity/heatmap`
- **Response Payload**:
  ```json
  {
    "success": true,
    "data": [
      { "date": "2026-08-01", "count": 5, "level": 2 },
      { "date": "2026-08-02", "count": 12, "level": 4 }
    ]
  }
  ```

---

## 2. User Topic Progress

**Goal**: Display topic progress bars showing completion percentages, time spent, and status.

### Data Source
- **Table**: `user_topic_progress` ([`src/app/progress/schema.ts`](file:///p:/Project/exambuddys/exam_server/src/app/progress/schema.ts))
- **Fields**: `user_id`, `topic_id`, `completed_nodes`, `total_nodes`, `time_spent`, `status`

### Backend Implementation

#### Service Layer ([`src/app/progress/service.ts`](file:///p:/Project/exambuddys/exam_server/src/app/progress/service.ts))
```typescript
import { db } from "@/db/index.js";
import { user_topic_progress, topics } from "@/db/schema.js";
import { eq } from "drizzle-orm";

export class ProgressService {
  async getUserTopicProgressList(userId: string) {
    return await db
      .select({
        topicId: user_topic_progress.topic_id,
        topicName: topics.name,
        percentage: sql<number>`ROUND((${user_topic_progress.completed_nodes}::numeric / NULLIF(${user_topic_progress.total_nodes}, 0)::numeric) * 100, 2)`,
        timeSpent: user_topic_progress.time_spent,
        status: user_topic_progress.status,
      })
      .from(user_topic_progress)
      .innerJoin(topics, eq(user_topic_progress.topic_id, topics.id))
      .where(eq(user_topic_progress.user_id, userId));
  }
}
```

#### API Endpoint
Mounted in [`src/app/progress/route.ts`](file:///p:/Project/exambuddys/exam_server/src/app/progress/route.ts):
- **GET** `/api/v1/progress/user/topics`

---

## ⚠️ Deprecations & Migration Notes
- **Prisma Removal**: Removed all `prisma.*` calls in favor of Drizzle ORM (`db.select().from(...)`).
- **File Locations**: Logic resides in `src/app/activity/` and `src/app/progress/`.
