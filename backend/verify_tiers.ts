import { UserService } from "./src/services/user.service.js";

async function main() {
    const userService = new UserService();
    try {
        const tiers = await userService.getSubscriptionTiers();
        console.log("Subscription Tiers:", JSON.stringify(tiers, null, 2));
    } catch (error) {
        console.error("Error fetching tiers:", error);
    }
}

main();
