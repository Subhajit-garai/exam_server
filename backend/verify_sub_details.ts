import { UserService } from "./src/services/user.service.js";
import prisma from "@repo/db/index.js";

async function main() {
    // Get a user ID (mock or real)
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found to test");
        return;
    }

    const userService = new UserService();
    try {
        const details = await userService.getUserSubscriptionDetails(user.id);
        console.log("Subscription Details:", JSON.stringify(details, null, 2));
    } catch (error) {
        console.error("Error fetching subscription details:", error);
    }
}

main();
