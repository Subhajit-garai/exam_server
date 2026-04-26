export const metrics = {
  recordSuccess: (name: string, time: number) => {
    // console.log(`[Metrics] ${name} succeeded in ${time}ms`);
  },
  recordFailure: (name: string) => {
    // console.log(`[Metrics] ${name} failed`);
  }
};
