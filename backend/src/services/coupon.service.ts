import prisma from "@repo/db/index.js";
import dayjs from "dayjs";

export class CouponService {
    async createCoupon(data: any, createdBy: string) {
        return await prisma.coupon.create({
            data: {
                ...data,
                createdBy,
            },
        });
    }

    async getAllCoupons() {
        return await prisma.coupon.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                createdUser: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async getCouponById(id: string) {
        return await prisma.coupon.findUnique({
            where: {
                id,
            },
        });
    }

    async updateCoupon(id: string, data: any) {
        return await prisma.coupon.update({
            where: {
                id,
            },
            data,
        });
    }

    async deleteCoupon(id: string) {
        return await prisma.coupon.delete({
            where: {
                id,
            },
        });
    }

    async validateAndApplyCoupon(code: string, userId: string, orderAmount: number) {
        // 1. Find Coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code },
        });

        if (!coupon) {
            throw new Error("Invalid coupon code");
        }

        // 2. Check Active Status
        if (!coupon.isActive) {
            throw new Error("Coupon is inactive");
        }

        // 3. Check Expiry
        if (coupon.expiresAt && dayjs().isAfter(dayjs(coupon.expiresAt))) {
            throw new Error("Coupon has expired");
        }

        // 4. Check Global Max Uses
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new Error("Coupon usage limit reached");
        }

        // 5. Check Per User Limit (Optional - simplistic check via CouponUsage count)
        // Since we are applying, we just check eligibility. Actual increment happens on purchase.
        // But for now, let's assume one use per user per coupon ID is enforced by DB unique constraint.
        const usage = await prisma.couponUsage.findUnique({
            where: {
                userId_couponId: {
                    userId,
                    couponId: coupon.id,
                },
            },
        });

        if (usage) {
            throw new Error("You have already used this coupon");
        }

        const orderAmountInPisa = orderAmount;


        if (coupon.minOrderAmount && orderAmountInPisa < coupon.minOrderAmount) {
            throw new Error(`Minimum order amount of ${coupon.minOrderAmount} required`);
        }

        // 7. Calculate Discount
        let discountAmount = 0;
        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (orderAmountInPisa * coupon.discountValue) / 100;
        } else if (coupon.discountType === "FIXED") {
            discountAmount = coupon.discountValue * 100; // Fixed value in Rupees -> Paise
        }

        if (discountAmount > orderAmountInPisa) {
            discountAmount = orderAmountInPisa;
        }


        const finalAmount = (orderAmountInPisa - discountAmount);
        return {
            couponId: coupon.id,
            code: coupon.code,
            discountAmount,
            finalAmount,
            message: "Coupon applied successfully"
        };
    }
}

export const couponService = new CouponService();
