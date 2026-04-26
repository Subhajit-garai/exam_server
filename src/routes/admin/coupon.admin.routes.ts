import { Router } from "express";
import { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon } from "../../controllers/coupon.controller.js";

export const couponRouter = Router();

couponRouter.post("/", createCoupon);
couponRouter.get("/", getAllCoupons);
couponRouter.get("/:id", getCouponById);
couponRouter.put("/:id", updateCoupon);
couponRouter.delete("/:id", deleteCoupon);
