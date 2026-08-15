import dayjs from "dayjs";
import { db } from "@/db/index.js";
import { coupons, coupon_usages, users } from "@/db/schema.js";
import { eq, and, desc as drizzleDesc } from "drizzle-orm";

export class CouponService {
  async createCoupon(data: any, createdBy: string) {
    const [coupon] = await db
      .insert(coupons)
      .values({
        ...data,
        created_by: createdBy,
      })
      .returning();
    return coupon;
  }

  async getAllCoupons() {
    const rows = await db
      .select({
        coupon: coupons,
        createdUser: {
          name: users.name,
          email: users.email,
        },
      })
      .from(coupons)
      .leftJoin(users, eq(coupons.created_by, users.id))
      .orderBy(drizzleDesc(coupons.created_at));

    return rows.map((row) => ({
      ...row.coupon,
      createdUser: row.createdUser,
    }));
  }

  async getCouponById(id: string) {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);
    return coupon || null;
  }

  async updateCoupon(id: string, data: any) {
    const [updated] = await db
      .update(coupons)
      .set({
        ...data,
      })
      .where(eq(coupons.id, id))
      .returning();
    return updated;
  }

  async deleteCoupon(id: string) {
    const [deleted] = await db
      .delete(coupons)
      .where(eq(coupons.id, id))
      .returning();
    return deleted;
  }

  async validateAndApplyCoupon(
    code: string,
    userId: string,
    orderAmount: number,
  ) {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    if (!coupon) {
      throw new Error("Invalid coupon code");
    }

    if (!coupon.is_active) {
      throw new Error("Coupon is inactive");
    }

    if (coupon.expires_at && dayjs().isAfter(dayjs(coupon.expires_at))) {
      throw new Error("Coupon has expired");
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      throw new Error("Coupon usage limit reached");
    }

    const [usage] = await db
      .select()
      .from(coupon_usages)
      .where(
        and(
          eq(coupon_usages.user_id, userId),
          eq(coupon_usages.coupon_id, coupon.id),
        ),
      )
      .limit(1);

    if (usage) {
      throw new Error("You have already used this coupon");
    }

    const orderAmountInPisa = orderAmount;

    if (
      coupon.min_order_amount &&
      orderAmountInPisa < coupon.min_order_amount
    ) {
      throw new Error(
        `Minimum order amount of ${coupon.min_order_amount} required`,
      );
    }

    let discountAmount = 0;
    if (coupon.discount_type === "PERCENTAGE") {
      discountAmount = (orderAmountInPisa * coupon.discount_value) / 100;
    } else if (coupon.discount_type === "FIXED") {
      discountAmount = coupon.discount_value * 100;
    }

    if (discountAmount > orderAmountInPisa) {
      discountAmount = orderAmountInPisa;
    }

    const finalAmount = orderAmountInPisa - discountAmount;
    return {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      finalAmount,
      message: "Coupon applied successfully",
    };
  }
}

export const couponService = new CouponService();
