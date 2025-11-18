// src/utils/metrics.ts
export const metrics = {
  recordSuccess: (task: string, time: number) =>
    console.log(`📈 [Metrics] ${task} success (${time}ms)`),
  recordFailure: (task: string) =>
    console.log(`📉 [Metrics] ${task} failed`),
};
