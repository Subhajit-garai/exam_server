import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { couponInputZodSchema, couponUpdateZodSchema } from "@/zod/coupon.zod.js";
import { couponService } from "@/services/coupon.service.js";

export const createCoupon = asyncHandler(async (req: any, res: any) => {
    const result = couponInputZodSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: result.error.errors });
    }

    const createdBy = req.user.id; // Assuming req.user is populated by auth middleware
    const coupon = await couponService.createCoupon(result.data, createdBy);
    return res.status(201).json({ success: true, message: "Coupon created", data: coupon });
});

export const getAllCoupons = asyncHandler(async (req: any, res: any) => {
    const coupons = await couponService.getAllCoupons();
    return res.json({ success: true, data: coupons });
});

export const getCouponById = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const coupon = await couponService.getCouponById(id);
    if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    return res.json({ success: true, data: coupon });
});

export const updateCoupon = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const result = couponUpdateZodSchema.safeParse({ ...req.body, id });
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: result.error.errors });
    }

    const coupon = await couponService.updateCoupon(id, result.data);
    return res.json({ success: true, message: "Coupon updated", data: coupon });
});

export const deleteCoupon = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    await couponService.deleteCoupon(id);
    return res.json({ success: true, message: "Coupon deleted" });
});
