
import { CronJob } from "cron";
import { SystemStateService } from "../../../services/system-state.service.js";

const systemStateService = new SystemStateService();

// Run every midnight
export const updateSystemStats = new CronJob(
    "0 0 * * *",
    async () => {
        console.log("Running midnight system stats update (Redis)...");
        await systemStateService.refreshSystemStats();
    },
    null,
    true,
    "Asia/Kolkata"
);

// Function to run on startup to ensure cache is populated
export const initSystemStats = async () => {
    try {
        console.log("Initializing system stats (Redis check)...");
        // Just calling getSystemStats will trigger refresh if missing
        await systemStateService.getSystemStats();
    } catch (e) {
        console.log("Failed to init system stats", e);
    }
};
