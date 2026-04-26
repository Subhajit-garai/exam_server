import { Router } from "express";
import { createSubscription, getAllSubscriptions, getSubscriptionById, updateSubscription, deleteSubscription } from "../../controllers/subscription.controller.js";

export const subscriptionRouter = Router();

subscriptionRouter.post("/", createSubscription);
subscriptionRouter.get("/", getAllSubscriptions);
subscriptionRouter.get("/:id", getSubscriptionById);
subscriptionRouter.put("/:id", updateSubscription);
subscriptionRouter.delete("/:id", deleteSubscription);
