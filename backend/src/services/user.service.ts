import { primeStatus, SocialPlatform } from "@repo/prisma/client.js"
import prisma from "@repo/db/index.js";
import {
    Createhash,
    generateResetToken,
    hashPasswordFn,
    veryfyhashPasswordFn,
} from "@repo/lib/security/hash.js";
import Mailer from "@repo/lib/messageService/nodemail.js";
import dayjs from "dayjs";
import { sendMessage_HtmlParse } from "@repo/lib/messageService/telgramMessenger.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { ProfileService } from "./profile.service.js";
import { logger } from "@/lib/helper/logger.js";


const profileService = new ProfileService();

export class UserService {
    async userPurchases(userId: string) {
        let User = await prisma.user.findFirst({
            where: {
                id: userId,
            },
        });
        if (!User) {
            throw new Error("user not exist");
        }

        let allPurchases = await prisma.payment.findMany({
            where: {
                userId: User.id,
            },
        });

        return allPurchases;
    }

    async auth(userId: string) {
        let User = await profileService.getProfile(userId);

        if (!User) {
            throw new Error("user not exist");
        }

        return User;
    }

    async userSignup(data: any) {
        let { name, email, password } = data;

        let isUserExist = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (isUserExist) {
            throw new Error("user already exist");
        }

        const hasspaword = await hashPasswordFn(password);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                prime: {
                    create: {
                        status: primeStatus.None,
                    },
                },
                social: {
                    create: {
                        platform: SocialPlatform.email,
                        link: email
                    }

                },
                balance: {
                    create: {
                        amount: 10,
                        ticket: 1,
                        last_update: new Date(),
                    },
                },
                password: hasspaword,
            },
        });

        await prisma.examProgress.create({
            data: {
                userId: newUser.id,
            },
        });
        await prisma.dppProgress.create({
            data: {
                userId: newUser.id,
            },
        });
        await prisma.quizProgress.create({
            data: {
                userId: newUser.id,
            },
        });

        return newUser;
    }

    async generateEmailValidationToken(email: string) {
        let User = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!User) {
            throw new CustomError("user not exist");
        }

        let { token, hashedToken } = generateResetToken("email");
        const expirationDate: Date = dayjs().add(10, "minute").toDate();

        let update = await prisma.user.update({
            where: {
                id: User.id,
            },
            data: {
                forgotpasswordToken: hashedToken,
                resetTokenExpires: expirationDate,
            },
        });

        if (!update) {
            throw new CustomError("token not set");
        }

        let mailer = new Mailer();
        await mailer.sendMail(
            email,
            "User email validation",
            `Your validation token is ${token}`
        );

        return true;
    }

    async verifyUserEmailValidationToken(token: string, email: string, userId?: string) {
        return await prisma.$transaction(async (tx: any) => {

            let token_hash = Createhash(token);
            let User: any;


            if (userId) {
                User = await tx.user.findUnique({
                    where: {
                        id: userId,
                        forgotpasswordToken: token_hash,
                    },
                });
            } else {

                User = await tx.user.findUnique({
                    where: {
                        email: email,
                        forgotpasswordToken: token_hash,
                    },
                });
            }
            logger.info(User)



            if (User) {

                if (User?.resetTokenExpires < new Date()) {
                    throw new Error("user not exist token expired");
                }

            } else {
                throw new Error("user not exist");
            }

            await tx.social.update({
                where: {
                    userId_platform: {
                        userId: User.id,
                        platform: SocialPlatform.email
                    }
                },
                data: {
                    isVerified: true,
                },
            });

            return User.id;
        });
    }

    async generateUserTelegramIdValidationToken(userId: string, telegramid: string) {


        let telegram = await prisma.social.findUnique({
            where: {
                userId_platform: {
                    userId: userId,
                    platform: SocialPlatform.telegram
                }

            }
        });

        if (!telegram) {
            throw new Error("user's telegram data not exist");
        }
        if (telegram.link !== telegramid) {
            throw new Error("user telegram id not match");
        }

        let { token, hashedToken } = generateResetToken("telegramid");
        const expirationDate: Date = dayjs().add(10, "minute").toDate();

        let update = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                forgotpasswordToken: hashedToken,
                resetTokenExpires: expirationDate,
            },
        });

        if (!update) {
            throw new Error("token not set");
        }

        const MESSAGE = `
<b>🔑 Your Access Token</b>

<code>${token}</code>

⚠️ <i>Do not share this token with anyone.</i>
⚠️ <i>You can hold the token to copy it.</i>
`;
        let message_state = await sendMessage_HtmlParse(
            parseInt(telegramid),
            MESSAGE
        );

        if (!message_state) {
            throw new Error("token not send");
        }

        return true;
    }

    async verifyUserTelegramIdValidationToken(userId: string, token: string) {
        return await prisma.$transaction(async (tx: any) => {
            let token_hash = Createhash(token);

            let User = await tx.user.findUnique({
                where: {
                    id: userId,
                    forgotpasswordToken: token_hash,
                },
            });

            if (!User || User?.resetTokenExpires < new Date()) {
                throw new Error("user not exist or token expired");
            }

            await tx.user.update({
                where: {
                    id: userId,
                },
                data: {
                    forgotpasswordToken: "-1",
                },
            });

            await tx.social.update({
                where: {
                    userId_platform: {
                        userId: userId,
                        platform: SocialPlatform.telegram
                    }
                },
                data: {
                    isVerified: true,
                },
            });

            return true;
        });
    }

    async generateUserForgotPasswordToken(email: string) {
        let User = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!User) {
            throw new Error("user not exist");
        }

        let { token, hashedToken } = generateResetToken();
        const expirationDate: Date = dayjs().add(10, "minute").toDate();

        let update = await prisma.user.update({
            where: {
                id: User.id,
            },
            data: {
                forgotpasswordToken: hashedToken,
                resetTokenExpires: expirationDate,
            },
        });

        if (!update) {
            throw new Error("token not set");
        }

        let mailer = new Mailer();
        await mailer.sendMail(
            email,
            "Reset Password",
            `Your reset password token is ${token}`
        );

        return true;
    }

    async verifyUserForgotPasswordToken(data: any) {
        let { email, ForgotpasswordToken, newpassword } = data;
        let token_hash = Createhash(ForgotpasswordToken);

        let User = await prisma.user.findUnique({
            where: {
                email: email,
                forgotpasswordToken: token_hash,
            },
        });

        if (!User || User?.resetTokenExpires < new Date()) {
            throw new Error("user not exist or token expired");
        }

        await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                password: await hashPasswordFn(newpassword),
                forgotpasswordToken: "-1",
            },
        });

        return true;
    }

    async userSignin(data: any) {
        let { email, password } = data;

        let User = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!User) {
            throw new Error("user not exist");
        }

        let veryfypassword = await veryfyhashPasswordFn(password, User.password);

        if (!veryfypassword) {
            throw new Error("credientile incurrect");
        }

        return User;
    }

    async updateUser(userId: string, data: any) {
        let { name, targeted_exam, exam_year } = data;

        let updateData: any = {};
        if (name) updateData.name = name;
        if (targeted_exam) updateData.targeted_exam = targeted_exam;
        if (exam_year) updateData.exam_year = exam_year;
        if (data.academicProfile) updateData.academicProfile = data.academicProfile;
        if (data.school) updateData.school = data.school;
        if (data.standard) updateData.standard = data.standard;
        if (data.stream) updateData.stream = data.stream;

        let updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: updateData,
        });

        return updatedUser;
    }

    async getUserTimeline(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { exam_year_id: true }
        });

        if (!user) {
            throw new CustomError("User not found", 404);
        }

        if (!user.exam_year_id || user.exam_year_id === "not set") {
            throw new CustomError("User need to update there Targect exam and Year first for exam timeline", 400)
        }

        const timelineEvents = await prisma.examTimeline.findMany({
            where: {
                exam_year: user.exam_year_id
            },
            orderBy: {
                date: 'asc'
            }
        });

        return timelineEvents;
    }

    async getSubscriptionTiers() {
        const tiers = await prisma.tier.findMany({
            include: {
                benefits: true,
                subcriptionOffers: {
                    where: {
                        // Assuming we want to show offers that are generally available or active
                        // For now, let's fetch all linked offers
                    }
                }
            },
            orderBy: {
                // You might want a specific order, e.g., by price or name
                // For now, let's just order by creation or name
                name: 'asc'
            }
        });
        return tiers;
    }

    async getUserSubscriptionDetails(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                prime: {
                    select: {
                        status: true,
                        expiry: true,
                        expiryInday: true
                    }
                }
            }
        });

        if (!user) throw new Error("User not found");

        const currentStatus = user.prime?.status || "None";

        // Fetch Tier details
        const tier = await prisma.tier.findUnique({
            where: { name: currentStatus },
            include: {
                benefits: true
            }
        });

        // Fetch latest subscription payment
        const lastPayment = await prisma.order.findFirst({
            where: {
                userId: userId,
                type: "SUBSCRIPTION",
                status: "success",
                subcription: currentStatus
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            currentPlan: currentStatus,
            expiry: user.prime?.expiry,
            expiryInday: user.prime?.expiryInday,
            tierDetails: tier,
            lastPayment: lastPayment ? {
                amount: lastPayment.amount,
                date: lastPayment.createdAt,
                orderId: lastPayment.id
            } : null
        };
    }
}
