import { asyncHandler } from "@/utils/asyncHandler.js";
import { offerInputZodSchema, offerUpdateZodSchema } from "@/zod/offer.zod.js";
import { offerService } from "./service.js";

export const createOffer = asyncHandler(async (req: any, res: any) => {
    const result = offerInputZodSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: result.error.errors });
    }

    const offer = await offerService.createOffer(result.data);
    return res.status(201).json({ success: true, message: "Offer created", data: offer });
});

export const getAllOffers = asyncHandler(async (req: any, res: any) => {
    const offers = await offerService.getAllOffers();
    return res.json({ success: true, data: offers });
});

export const getOfferById = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const offer = await offerService.getOfferById(id);
    if (!offer) {
        return res.status(404).json({ success: false, message: "Offer not found" });
    }
    return res.json({ success: true, data: offer });
});

export const updateOffer = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const result = offerUpdateZodSchema.safeParse({ ...req.body, id });
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: result.error.errors });
    }

    const offer = await offerService.updateOffer(id, result.data);
    return res.json({ success: true, message: "Offer updated", data: offer });
});

export const deleteOffer = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    await offerService.deleteOffer(id);
    return res.json({ success: true, message: "Offer deleted" });
});
