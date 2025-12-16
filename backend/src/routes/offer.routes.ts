import { Router } from "express";
import { createOffer, getAllOffers, getOfferById, updateOffer, deleteOffer } from "@/controllers/offer.controller.js";

export const offerRouter = Router();

offerRouter.post("/", createOffer);
offerRouter.get("/", getAllOffers);
offerRouter.get("/:id", getOfferById);
offerRouter.put("/:id", updateOffer);
offerRouter.delete("/:id", deleteOffer);
