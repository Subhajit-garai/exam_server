import { razerpayinstance } from "../server.js";
import crypto from "crypto";
import prisma from "@repo/db/index.js";
import { primeStatus, purchaseType } from "@repo/prisma/client.js";
import {
    isUserHavePrime,
    ProvideSubcriptionTouser,
} from "@repo/lib/helper/payment.js";

export class PaymentService {
    private async isPaymentProcessed(paymentId: string) {
        const payment = await prisma.payment.findUnique({
            where: {
                razorpay_payment_id: paymentId,
            },
        });
        return !!payment; // Return true if payment already processed
    }

    async checkoutSubcription(userId: string, plan: primeStatus, amount: string, type: string) {
        if (type !== "SUBSCRIPTION")
            throw Error("we can not porccesd with wornd plan / payment ");

        let isPlanExist = await prisma.subcriptionOffers.findFirst({
            where: {
                type: type,
                title: plan,
            },
        });

        if (!isPlanExist)
            throw Error("we can not porccesd with wrong plan / payment ");

        await isUserHavePrime(userId);

        let tierInfo = await prisma.tier.findFirst({
            where: {
                name: plan,
            },
        });
        if (!tierInfo) throw Error(" We are not provided , given / seleced Plan");

        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            notes: {
                plan: plan,
                type: type,
            },
        };

        const order = await razerpayinstance.orders.create(options);

        await prisma.order.create({
            data: {
                razorpay_order_id: order.id,
                amount: parseInt(order.amount as string),
                subcription: plan,
                type: type,
                userId: userId,
            },
        });

        return order;
    }

    async checkoutToken(userId: string, plan: string, amount: string, type: string) {
        if (type !== "TOKEN")
            throw Error("we can not porccesd with wornd plan / payment ");

        let isPlanExist = await prisma.subcriptionOffers.findFirst({
            where: {
                type: type,
                title: plan,
            },
        });

        if (!isPlanExist)
            throw Error("we can not porccesd with wrong plan / payment ");

        let { token } = isPlanExist;

        if (!token) throw Error("Invalid token ! , contact admin");

        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            notes: {
                token: token.toString(),
                type: purchaseType.TOKEN,
            },
        };
        const order = await razerpayinstance.orders.create(options);

        await prisma.order.create({
            data: {
                razorpay_order_id: order.id,
                amount: parseInt(order.amount as string),
                token: token,
                userId: userId,
            },
        });

        return order;
    }

    async paymentVerification(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) {
        return await prisma.$transaction(async (tx: any) => {
            if (await this.isPaymentProcessed(razorpay_payment_id)) {
                throw new Error("Duplicate payment detected");
            }

            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZERPAY_API_SECRET as string)
                .update(body.toString())
                .digest("hex");

            const isAuthentic = expectedSignature === razorpay_signature;

            if (isAuthentic) {
                const orderDetails = await razerpayinstance.orders.fetch(
                    razorpay_order_id
                );

                // check is it token or subcription
                let { amount, status, notes } = orderDetails;

                if (!notes) throw Error("payment issue occere ");

                let { type } = notes;

                switch (type as purchaseType) {
                    case "SUBSCRIPTION":
                        {
                            amount = typeof amount == "string" ? parseInt(amount) : amount;

                            let user = await tx.order.update({
                                where: {
                                    razorpay_order_id: razorpay_order_id,
                                },
                                data: {
                                    status: status,
                                },
                                select: {
                                    userId: true,
                                    subcription: true,
                                },
                            });

                            let userid = user?.userId;
                            let subcription = user?.subcription;
                            // Database update here

                            await tx.payment.create({
                                data: {
                                    razorpay_order_id,
                                    razorpay_payment_id,
                                    razorpay_signature,
                                    amount: amount,
                                    status: status,
                                    userId: userid,
                                },
                            });

                            await ProvideSubcriptionTouser(userid, subcription, orderDetails);
                        }
                        break;
                    case "TOKEN":
                        {
                            amount = typeof amount == "string" ? parseInt(amount) : amount;

                            let user = await tx.order.update({
                                where: {
                                    razorpay_order_id: razorpay_order_id,
                                },
                                data: {
                                    status: status,
                                },
                                select: {
                                    userId: true,
                                    token: true,
                                },
                            });

                            let userid = user?.userId;
                            let token = user?.token;
                            // Database update here

                            await tx.payment.create({
                                data: {
                                    razorpay_order_id,
                                    razorpay_payment_id,
                                    razorpay_signature,
                                    amount: amount,
                                    status: status,
                                    userId: userid,
                                },
                            });

                            await prisma.balance.update({
                                where: {
                                    userid: userid,
                                },
                                data: {
                                    amount: {
                                        increment: token,
                                    },
                                },
                                select: {
                                    amount: true,
                                },
                            });
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
        let data = await prisma.subcriptionOffers.findMany({});
        return data;
    }
    async getSubcriptionAndOfferFormated() {
        let data = await prisma.subcriptionOffers.findMany({

            include: {
                target_exam: true
            }
        });
        return data;
    }
}
