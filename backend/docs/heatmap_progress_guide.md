# Heatmap & Progress Bar Implementation Guide

This guide details how to implement a user activity heatmap and a topic progress bar using the existing `UserActivity` and `UserTopicProgress` data models.

## 1. Activity Heatmap

**Goal**: Display a visual representation of user activity intensity over time (similar to GitHub contributions).

### Data Source
- **Table**: `UserActivity` (`prisma/schema/activity.prisma`)
- **Fields**: `date`, `xp`, `type`

### Backend Implementation

#### Service Layer (`ActivityService`)
Add a new method `getActivityHeatmap` to `src/services/activity.service.ts`:

```typescript
// src/services/activity.service.ts

/**
 * Get aggregated activity data for heatmap.
 * Returns an array of { date: string, count: number, totalXP: number }
 */
async getActivityHeatmap(userId: string) {
    const activities = await prisma.userActivity.groupBy({
        by: ['date'],
        where: { userId },
        _count: { id: true },
        _sum: { xp: true },
        orderBy: { date: 'asc' }
    });

    return activities.map(entry => ({
        date: entry.date.toISOString().split('T')[0], // YYYY-MM-DD
        count: entry._count.id,
        level: this.calculateHeatmapLevel(entry._count.id) // Optional: Helper to determine color intensity (0-4)
    }));
}

// Helper for intensity
private calculateHeatmapLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
}
```

#### API Endpoint
Create a new endpoint in `activity.routes.ts` (or similar):
- **GET** `/api/activity/heatmap`
- **Response**:
  ```json
  [
    { "date": "2023-01-01", "count": 5, "level": 2 },
    { "date": "2023-01-02", "count": 12, "level": 4 }
  ]
  ```

### Frontend Implementation
Use a library like `react-calendar-heatmap` or build a custom grid.

```tsx
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

// ... inside your component
<CalendarHeatmap
  startDate={new Date('2023-01-01')}
  endDate={new Date('2023-12-31')}
  values={heatmapData} // [{ date: '2023-01-01', count: 12 }, ... ]
  classForValue={(value) => {
    if (!value) return 'color-empty';
    return `color-scale-${value.level}`;
  }}
/>
```

---

## 2. Topic Progress Bar

**Goal**: Display a progress bar for a specific topic based on time spent reading/studying.

### Data Source
- **Table**: `UserTopicProgress` (`prisma/schema/progress.prisma`) & `Topic` (`prisma/schema/note.prisma`)
- **Fields**: 
    - `UserTopicProgress.timeSpent` (seconds)
    - `Topic.estimatedReadTime` (minutes)

### Backend Implementation

#### Service Layer (`ProgressService`)
Add/Update method in `src/services/progress.service.ts`.

```typescript
// src/services/progress.service.ts

async getTopicProgress(userId: string, topicId: string) {
    const progress = await prisma.userTopicProgress.findUnique({
        where: { userId_topicId: { userId, topicId } },
        include: { topic: { select: { estimatedReadTime: true } } }
    });

    if (!progress) return { percentage: 0, timeSpent: 0, status: 'NOT_STARTED' };

    const estimatedMinutes = progress.topic.estimatedReadTime || 10; // Default 10 mins if not set
    const estimatedSeconds = estimatedMinutes * 60;
    
    // Calculate percentage (capped at 100%)
    const percentage = Math.min(
        (progress.timeSpent / estimatedSeconds) * 100, 
        100
    );

    return {
        percentage: Math.round(percentage),
        timeSpent: progress.timeSpent, // seconds
        status: progress.status
    };
}
```

#### API Endpoint
Create a new endpoint in `progress.routes.ts`:
- **GET** `/api/progress/topic/:topicId`
- **Response**:
  ```json
  {
    "percentage": 50,
    "timeSpent": 300,
    "status": "IN_PROGRESS"
  }
  ```

### Frontend Implementation
Create a generic `ProgressBar` component.

```tsx
// Components/ProgressBar.tsx
const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
    <div 
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

// Usage
const progress = useTopicProgress(topicId); // Custom hook to fetch data
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Progress</span>
    <span>{progress.percentage}%</span>
  </div>
  <ProgressBar value={progress.percentage} />
</div>
```
