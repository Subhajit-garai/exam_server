import { primeStatus } from "@repo/prisma/client.js"
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
        let User = await prisma.user.findFirst({
            where: {
                id: userId,
            },
            select: {
                name: true,
                email: true,
                blance: {
                    select: {
                        amount: true,
                        ticket: true,
                    },
                },
                prime: {
                    select: {
                        status: true,
                    },
                },
                verification: {
                    select: {
                        email: true,
                        telegram: true,
                        whatsapp: true,
                    },
                },
                telegram: {
                    select: {
                        telegramid: true,
                    },
                },
            },
        });

        if (!User) {
            throw new Error("user not exist");
        }

        return User;
    }

    async userSignup(data: any) {
        let { name, email, password, telegramid } = data;

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
                telegram: {
                    create: {
                        telegramid: telegramid || "123456790",
                        last_update: new Date(),
                    },
                },
                blance: {
                    create: {
                        amount: 10,
                        ticket: 1,
                        last_update: new Date(),
                    },
                },
                verification: {
                    create: {},
                },
                password: hasspaword,
            },
        });

        await prisma.progress.create({
            data: {
                userid: newUser.id,
            },
        });

        return newUser;
    }

    async useremailValidationTokengen(email: string) {
        let User = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!User) {
            throw new Error("user not exist");
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
            throw new Error("token not set");
        }

        let mailer = new Mailer();
        await mailer.sendMail(
            email,
            "User email validation",
            `Your validation token is ${token}`
        );

        return true;
    }

    async useremailValidationTokenVerify(token: string, email: string, userId?: string) {
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

            if (User) {
                if (User?.resetTokenExpires < new Date()) {
                    throw new Error("user not exist token expired");
                }
            } else {
                throw new Error("user not exist");
            }

            await tx.verification.update({
                where: {
                    id: User?.verificationid as string,
                },
                data: {
                    email: true,
                },
            });

            return User.id;
        });
    }

    async usertelegramidValidationTokengen(userId: string, telegramid: string) {
        let User = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                telegram: {
                    select: {
                        telegramid: true,
                    },
                },
            },
        });

        if (!User) {
            throw new Error("user not exist");
        }

        if (User?.telegram?.telegramid !== telegramid) {
            throw new Error("user telegram id not match");
        }

        let { token, hashedToken } = generateResetToken("telegramid");
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

    async usertetegramidValidationTokenVerify(userId: string, token: string) {
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

            await tx.verification.update({
                where: {
                    id: User.verificationid as string,
                },
                data: {
                    telegram: true,
                },
            });

            return true;
        });
    }

    async userForgotpasswordTokenGen(email: string) {
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

    async userForgotpasswordTokenVerify(data: any) {
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
}
