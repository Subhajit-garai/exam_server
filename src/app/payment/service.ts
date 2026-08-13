import { razorpayInstance } from "@/server.js";
import crypto from "crypto";
import { db } from "@repo/db/index.js";
import { payments, orders } from "@repo/db/schema/payment.js";
import { subscription_offers } from "@repo/db/schema/offer.js";
import { tiers } from "@repo/db/schema/tier.js";
import { coupons, coupon_usages } from "@repo/db/schema/coupon.js";
import { balances } from "@repo/db/schema/user.js";
import { target_exams } from "@repo/db/schema/exam.js";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "@/utils/logger.js";
import { primeStatus, purchaseType } from "@repo/db/schema/enums.js";
import { isUserHavePrime, ProvideSubcriptionTouser } from "@/utils/payment.js";
import { couponService } from "../coupon/service.js";

export class PaymentService {
  private async isPaymentProcessed(paymentId: string) {
    const [pay] = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.razorpay_payment_id, paymentId));
    return !!pay;
  }

  async checkoutSubcription(
    userId: string,
    plan: primeStatus,
    amount: string,
    type: string,
    couponCode?: string,
  ) {
    if (type !== "SUBSCRIPTION")
      throw Error("we can not proceed with wrong plan / payment ");

    const [isPlanExist] = await db
      .select()
      .from(subscription_offers)
      .where(
        and(
          eq(subscription_offers.type, type),
          eq(subscription_offers.title, plan),
        ),
      );

    if (!isPlanExist)
      throw Error("we can not proceed with wrong plan / payment ");

    await isUserHavePrime(userId);

    const [tierInfo] = await db
      .select()
      .from(tiers)
      .where(eq(tiers.name, plan));
    if (!tierInfo) throw Error(" We are not provided , given / selected Plan");

    let { price } = isPlanExist;
    logger.debug("plan price", price);

    let finalAmount = Number(amount);
    if (finalAmount !== price * 100) {
      throw Error(" Plan value not matched");
    }

    let couponId = undefined;
    if (couponCode) {
      const couponResult = await couponService.validateAndApplyCoupon(
        couponCode,
        userId,
        finalAmount,
      );
      finalAmount = couponResult.finalAmount;
      couponId = couponResult.couponId;
    }

    const options = {
      amount: finalAmount,
      currency: "INR",
      notes: {
        plan: plan,
        type: type,
      },
    };

    let order;
    try {
      order = await razorpayInstance.orders.create(options);
    } catch (error: any) {
      logger.error("Razorpay Order Error:", error);
    }

    if (!order) throw Error("order not created");

    await db.insert(orders).values({
      razorpay_order_id: order.id,
      amount: parseInt(order.amount as string),
      subscription: plan,
      type: type as any,
      user_id: userId,
      coupon_id: couponId,
      updated_at: new Date(),
    });

    return order;
  }

  async checkoutToken(
    userId: string,
    plan: string,
    amount: string,
    type: string,
    couponCode?: string,
  ) {
    if (type !== "TOKEN")
      throw Error("we can not proceed with wrong plan / payment ");

    const [isPlanExist] = await db
      .select()
      .from(subscription_offers)
      .where(
        and(
          eq(subscription_offers.type, type),
          eq(subscription_offers.title, plan),
        ),
      );

    if (!isPlanExist)
      throw Error("we can not proceed with wrong plan / payment ");

    let { token, price } = isPlanExist;
    if (!token) throw Error("Invalid token ! , contact admin");

    let finalAmount = Number(amount);
    if (finalAmount !== price * 100) {
      throw Error(" Plan value not matched");
    }

    let couponId = undefined;
    if (couponCode) {
      const couponResult = await couponService.validateAndApplyCoupon(
        couponCode,
        userId,
        finalAmount,
      );
      finalAmount = couponResult.finalAmount;
      couponId = couponResult.couponId;
    }

    const options = {
      amount: finalAmount,
      currency: "INR",
      notes: {
        token: token.toString(),
        type: "TOKEN",
      },
    };
    const order = await razorpayInstance.orders.create(options);

    await db.insert(orders).values({
      razorpay_order_id: order.id,
      amount: parseInt(order.amount as string),
      token: token,
      user_id: userId,
      coupon_id: couponId,
      updated_at: new Date(),
    });

    return order;
  }

  async paymentVerification(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) {
    return await db.transaction(async (tx) => {
      if (await this.isPaymentProcessed(razorpay_payment_id)) {
        throw new Error("Duplicate payment detected");
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        const orderDetails =
          await razorpayInstance.orders.fetch(razorpay_order_id);
        let { amount, status, notes } = orderDetails;
        if (!notes) throw Error("payment issue occurred ");

        let { type } = notes;

        switch (type as purchaseType) {
          case "SUBSCRIPTION":
            {
              const amt =
                typeof amount == "string"
                  ? parseInt(amount)
                  : (amount as number);

              const [userOrder] = await tx
                .update(orders)
                .set({ status: status, updated_at: new Date() })
                .where(eq(orders.razorpay_order_id, razorpay_order_id))
                .returning({
                  userId: orders.user_id,
                  subscription: orders.subscription,
                  couponId: orders.coupon_id,
                });

              if (!userOrder) throw new Error("Order not found");

              let userid = userOrder.userId;
              let subscription = userOrder.subscription;
              let couponId = userOrder.couponId;

              if (couponId) {
                await tx
                  .update(coupons)
                  .set({ used_count: sql`${coupons.used_count} + 1` })
                  .where(eq(coupons.id, couponId));

                await tx.insert(coupon_usages).values({
                  user_id: userid,
                  coupon_id: couponId,
                });
              }

              await tx.insert(payments).values({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                amount: amt,
                status: status,
                user_id: userid,
                updated_at: new Date(),
              });

              await ProvideSubcriptionTouser(
                userid,
                subscription as primeStatus,
                orderDetails,
              );
            }
            break;
          case "TOKEN":
            {
              const amt =
                typeof amount == "string"
                  ? parseInt(amount)
                  : (amount as number);

              const [userOrder] = await tx
                .update(orders)
                .set({ status: status, updated_at: new Date() })
                .where(eq(orders.razorpay_order_id, razorpay_order_id))
                .returning({
                  userId: orders.user_id,
                  token: orders.token,
                  couponId: orders.coupon_id,
                });

              if (!userOrder) throw new Error("Order not found");

              let userid = userOrder.userId;
              let tokenCount = userOrder.token;
              let couponId = userOrder.couponId;

              if (couponId) {
                await tx
                  .update(coupons)
                  .set({ used_count: sql`${coupons.used_count} + 1` })
                  .where(eq(coupons.id, couponId));

                await tx.insert(coupon_usages).values({
                  user_id: userid,
                  coupon_id: couponId,
                });
              }

              await tx.insert(payments).values({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                amount: amt,
                status: status,
                user_id: userid,
                updated_at: new Date(),
              });

              if (tokenCount) {
                await tx
                  .update(balances)
                  .set({
                    amount: sql`${balances.amount} + ${tokenCount}`,
                    last_update: new Date(),
                  })
                  .where(eq(balances.user_id, userid));
              }
            }
            break;

          default:
            throw Error("Invalid service ");
        }

        return true;
      } else {
        throw new Error("Payment not valid");
      }
    });
  }

  async getSubcriptionAndOffer() {
    return await db.select().from(subscription_offers);
  }

  async getSubcriptionAndOfferFormated() {
    const rows = await db
      .select({
        offer: subscription_offers,
        target_exam: target_exams,
      })
      .from(subscription_offers)
      .leftJoin(
        target_exams,
        eq(subscription_offers.target_exam_id, target_exams.id),
      );

    return rows.map((r) => ({
      ...r.offer,
      target_exam: r.target_exam,
    }));
  }
}
