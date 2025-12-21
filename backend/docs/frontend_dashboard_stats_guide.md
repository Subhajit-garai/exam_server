# Dashboard Stats Implementation Guide

This guide explains how to populate the User Dashboard Statistics (Tests Attempted, Score, Hours, Accuracy) using the backend API.

## 1. API Endpoint

*   **URL**: `/api/v1/progress/dashboard-stats`
*   **Method**: `GET`
*   **Auth**: Required
*   **Response Structure**:
    ```json
    {
      "success": true,
      "data": {
        "studyHours": "45h",
        "stats": {
            "studyHours": {
                "hours": "45h",
                "trend": { "today": 1.5, "yesterday": 2.0, "increase": false }
            },
            "testsAttempted": {
                "testsAttempted": 12,
                "trend": { "today": 2, "yesterday": 1, "increase": true }
            },
            "avgScore": {
                "avgScore": "78%",
                "trend": { "today": 80, "yesterday": 75, "increase": true }
            },
            "accuracy": {
                "accuracy": "85%",
                "trend": { "today": 90, "yesterday": 80, "increase": true }
            }
        }
      }
    }
    ```

## 2. Frontend Integration

In your React component (e.g., `DashboardStats.tsx`), fetch this data and map it to your `stats` array.

### Code Example

```tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { IconBook, IconTrophy, IconClock, IconChartBar } from "your-icon-library"; // Adjust imports

export const DashboardStats = () => {
  const [data, setData] = useState({
    testsAttempted: 0,
    avgScore: "0%",
    avgScore: "0%",
    studyHours: "0h",
    accuracy: "0%",
    trend: { today: 0, yesterday: 0, increase: false }
  });

  useEffect(() => {
    // Fetch stats on mount
    axios.get("/api/v1/progress/dashboard-stats")
      .then(res => {
        if(res.data.success) {
          // Flatten the nested structure for easier usage if needed
          const { stats } = res.data.data;
          setData({
            testsAttempted: stats.testsAttempted.testsAttempted,
            avgScore: stats.avgScore.avgScore,
            studyHours: stats.studyHours.hours,
            accuracy: stats.accuracy.accuracy,
            trend: stats.studyHours.trend // Example: showing study trend
          });
        }
      })
      .catch(err => console.error("Failed to fetch stats", err));
  }, []);

  // Map API data to UI structure
  const stats = [
    { 
      label: "Tests Attempted", 
      value: data.testsAttempted.toString(), 
      icon: <IconBook size={24} />, 
      color: "text-[var(--color-blue)]", 
      bg: "bg-[var(--color-blue-soft)]" 
    },
    { 
      label: "Avg Score", 
      value: data.avgScore, 
      icon: <IconTrophy size={24} />, 
      color: "text-[var(--color-yellow)]", 
      bg: "bg-[var(--color-yellow-soft)]" 
    },
    { 
      label: "Study Hours", 
      value: data.studyHours, 
      icon: <IconClock size={24} />, 
      color: "text-[var(--color-purple)]", 
      bg: "bg-[var(--color-purple-soft)]" 
    },
    { 
      label: "Accuracy", 
      value: data.accuracy, 
      icon: <IconChartBar size={24} />, 
      color: "text-[var(--color-green)]", 
      bg: "bg-[var(--color-green-soft)]" 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className={`p-4 rounded-lg flex items-center gap-3 ${stat.bg}`}>
          <div className={`${stat.color}`}>{stat.icon}</div>
          <div>
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="font-bold text-xl">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
```
