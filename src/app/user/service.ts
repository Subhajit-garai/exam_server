import { primeStatus, SocialPlatform } from "@/db/enums.js";
import { db } from "@/db/index.js";
import {
  users,
  socials,
  primes,
  balances,
  orders,
  payments,
  exam_progress,
  dpp_progress,
  quiz_progress,
  exam_timelines,
  tiers,
  tier_benefits,
} from "@/db/schema.js";
import { eq, and, desc as drizzleDesc, inArray } from "drizzle-orm";
import {
  Createhash,
  generateResetToken,
  hashPasswordFn,
  veryfyhashPasswordFn,
} from "@/lib/security/hash.js";
import dayjs from "dayjs";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { ProfileService } from "../profile/service.js";
import { logger } from "@/utils/logger.js";
import {
  buildEmailNotification,
  buildTelegramNotification,
} from "@subhajit60/notification-engine";
import { MessageDispatcher } from "@/lib/notification/notificatinProcesser.js";

const profileService = new ProfileService();

export class UserService {
  async userPurchases(userId: string) {
    const [UserObj] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!UserObj) {
      throw new Error("User not found");
    }

    const allPurchases = await db
      .select()
      .from(payments)
      .where(eq(payments.user_id, UserObj.id));

    return allPurchases;
  }

  async auth(userId: string) {
    const UserObj = await profileService.getProfile(userId);

    if (!UserObj) {
      throw new Error("User not found");
    }

    return UserObj;
  }

  async userSignup(data: any) {
    const { name, email, password } = data;

    const [isUserExist] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (isUserExist) {
      throw new Error("User already exists");
    }

    const hasspaword = await hashPasswordFn(password);

    return await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          name,
          email,
          password: hasspaword,
          is_online: false,
        })
        .returning();

      await tx.insert(primes).values({
        user_id: newUser.id,
        status: "None",
      });

      await tx.insert(socials).values({
        user_id: newUser.id,
        platform: "email",
        link: email,
        is_verified: false,
        updated_at: new Date(),
      });

      await tx.insert(balances).values({
        user_id: newUser.id,
        amount: 10,
        ticket: 1,
        last_update: new Date(),
      });

      await tx.insert(exam_progress).values({
        user_id: newUser.id,
        attended: 0,
        total_questions_attempted: 0,
        total_correct: 0,
        accuracy: 0,
        last_rank: 0,
        best_rank: 0,
      });
      await tx.insert(dpp_progress).values({
        user_id: newUser.id,
        solved_count: 0,
        questions_solved: 0,
        current_streak: 0,
      });
      await tx.insert(quiz_progress).values({
        user_id: newUser.id,
        attended: 0,
        total_score: 0,
      });

      return newUser;
    });
  }

  async generateEmailValidationToken(email: string) {
    const [UserObj] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!UserObj) {
      throw new CustomError("User not found");
    }

    const { token, hashedToken } = generateResetToken("email");
    const expirationDate: Date = dayjs().add(10, "minute").toDate();

    const [update] = await db
      .update(users)
      .set({
        forgot_password_token: hashedToken,
        reset_token_expires: expirationDate,
      })
      .where(eq(users.id, UserObj.id))
      .returning();

    if (!update) {
      throw new CustomError("token not set");
    }

    const message = buildEmailNotification(
      "token",
      "success",
      `Your validation token is ${token}`,
      "User email validation",
    );
    MessageDispatcher.dispatch(message, email);

    return true;
  }

  async verifyUserEmailValidationToken(
    token: string,
    email: string,
    userId?: string,
  ) {
    return await db.transaction(async (tx) => {
      const token_hash = Createhash(token);
      let UserObj: any;

      if (userId) {
        [UserObj] = await tx
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, userId),
              eq(users.forgot_password_token, token_hash),
            ),
          )
          .limit(1);
      } else {
        [UserObj] = await tx
          .select()
          .from(users)
          .where(
            and(
              eq(users.email, email),
              eq(users.forgot_password_token, token_hash),
            ),
          )
          .limit(1);
      }

      if (UserObj) {
        if (UserObj?.reset_token_expires < new Date()) {
          throw new Error("User not found — token expired");
        }
      } else {
        throw new Error("User not found");
      }

      const [existingSocial] = await tx
        .select()
        .from(socials)
        .where(
          and(eq(socials.user_id, UserObj.id), eq(socials.platform, "email")),
        )
        .limit(1);

      if (existingSocial) {
        await tx
          .update(socials)
          .set({
            is_verified: true,
            updated_at: new Date(),
          })
          .where(eq(socials.id, existingSocial.id));
      }

      return UserObj.id;
    });
  }

  async generateUserTelegramIdValidationToken(
    userId: string,
    telegramid: string,
  ) {
    const [telegram] = await db
      .select()
      .from(socials)
      .where(and(eq(socials.user_id, userId), eq(socials.platform, "telegram")))
      .limit(1);

    if (!telegram) {
      throw new Error("Telegram account not linked to this user");
    }
    if (telegram.link !== telegramid) {
      throw new Error("Telegram ID does not match");
    }

    const { token, hashedToken } = generateResetToken("telegramid");
    const expirationDate: Date = dayjs().add(10, "minute").toDate();

    const [update] = await db
      .update(users)
      .set({
        forgot_password_token: hashedToken,
        reset_token_expires: expirationDate,
      })
      .where(eq(users.id, userId))
      .returning();

    if (!update) {
      throw new Error("Failed to set token");
    }

    const MESSAGE = `
<b>🔑 Your Access Token</b>

<code>${token}</code>

⚠️ <i>Do not share this token with anyone.</i>
⚠️ <i>You can hold the token to copy it.</i>
`;

    const message = buildTelegramNotification(
      "token",
      "success",
      MESSAGE,
      "Telegram Token",
    );
    MessageDispatcher.dispatch(message, telegramid);

    return true;
  }

  async verifyUserTelegramIdValidationToken(userId: string, token: string) {
    return await db.transaction(async (tx) => {
      const token_hash = Createhash(token);

      const [UserObj] = await tx
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, userId),
            eq(users.forgot_password_token, token_hash),
          ),
        )
        .limit(1);

      if (!UserObj || UserObj?.reset_token_expires < new Date()) {
        throw new Error("User not found or token expired");
      }

      await tx
        .update(users)
        .set({
          forgot_password_token: "-1",
        })
        .where(eq(users.id, userId));

      const [existingSocial] = await tx
        .select()
        .from(socials)
        .where(
          and(eq(socials.user_id, userId), eq(socials.platform, "telegram")),
        )
        .limit(1);

      if (existingSocial) {
        await tx
          .update(socials)
          .set({
            is_verified: true,
            updated_at: new Date(),
          })
          .where(eq(socials.id, existingSocial.id));
      }

      return true;
    });
  }

  async generateUserForgotPasswordToken(email: string) {
    const [UserObj] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!UserObj) {
      throw new Error("User not found");
    }

    const { token, hashedToken } = generateResetToken();
    const expirationDate: Date = dayjs().add(10, "minute").toDate();

    const [update] = await db
      .update(users)
      .set({
        forgot_password_token: hashedToken,
        reset_token_expires: expirationDate,
      })
      .where(eq(users.id, UserObj.id))
      .returning();

    if (!update) {
      throw new Error("Failed to set token");
    }

    const message = buildEmailNotification(
      "token",
      "success",
      `Your reset password token is ${token}`,
      "Reset Password",
    );
    MessageDispatcher.dispatch(message, email);

    return true;
  }

  async verifyUserForgotPasswordToken(data: any) {
    const { email, ForgotpasswordToken, newpassword } = data;
    const token_hash = Createhash(ForgotpasswordToken);

    const [UserObj] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.forgot_password_token, token_hash),
        ),
      )
      .limit(1);

    if (!UserObj || UserObj?.reset_token_expires < new Date()) {
      throw new Error("User not found or token expired");
    }

    const hashed = await hashPasswordFn(newpassword);

    await db
      .update(users)
      .set({
        password: hashed,
        forgot_password_token: "-1",
      })
      .where(eq(users.email, email));

    return true;
  }

  async userSignin(data: any) {
    const { email, password } = data;

    const [UserObj] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!UserObj) {
      throw new Error("User not found");
    }

    const veryfypassword = await veryfyhashPasswordFn(
      password,
      UserObj.password,
    );

    logger.info("veryfypassword", veryfypassword);

    if (!veryfypassword) {
      throw new Error("Incorrect credentials");
    }

    return UserObj;
  }

  async updateUser(userId: string, data: any) {
    const { name, targeted_exam, exam_year } = data;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (targeted_exam) updateData.targeted_exam_id = targeted_exam;
    if (exam_year) updateData.exam_year_id = exam_year;
    if (data.academicProfile)
      updateData.academic_profile = data.academicProfile;
    if (data.school) updateData.school = data.school;
    if (data.standard) updateData.standard = data.standard;
    if (data.stream) updateData.stream = data.stream;

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  async getUserTimeline(userId: string) {
    const [user] = await db
      .select({ exam_year_id: users.exam_year_id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (!user.exam_year_id || user.exam_year_id === "not set") {
      throw new CustomError(
        "Please update your target exam and year to view the exam timeline",
        400,
      );
    }

    const timelineEvents = await db
      .select()
      .from(exam_timelines)
      .where(eq(exam_timelines.exam_year_id, user.exam_year_id))
      .orderBy(exam_timelines.date);

    return timelineEvents;
  }

  async getSubscriptionTiers() {
    const tiersList = await db.select().from(tiers).orderBy(tiers.name);
    const tierIds = tiersList.map((t) => t.id);
    const allBenefits =
      tierIds.length > 0
        ? await db
            .select()
            .from(tier_benefits)
            .where(inArray(tier_benefits.tier_id, tierIds))
        : [];

    const tiersData = tiersList.map((tier) => ({
      ...tier,
      benefits: allBenefits.filter((b) => b.tier_id === tier.id),
    }));
    return tiersData;
  }

  async getUserSubscriptionDetails(userId: string) {
    const [row] = await db
      .select({
        id: users.id,
        primeStatus: primes.status,
        primeExpiry: primes.expiry,
        primeExpiryInday: primes.expiry_in_day,
      })
      .from(users)
      .leftJoin(primes, eq(users.id, primes.user_id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) throw new Error("User not found");

    const user = {
      id: row.id,
      prime: {
        status: row.primeStatus,
        expiry: row.primeExpiry,
        expiryInday: row.primeExpiryInday,
      },
    };

    const currentStatus = (user.prime as any)?.status || "None";

    const [tierData] = await db
      .select()
      .from(tiers)
      .where(eq(tiers.name, currentStatus))
      .limit(1);
    let tier = null;
    if (tierData) {
      const benefits = await db
        .select()
        .from(tier_benefits)
        .where(eq(tier_benefits.tier_id, tierData.id));
      tier = { ...tierData, benefits };
    }

    const [lastPayment] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.user_id, userId),
          eq(orders.type, "SUBSCRIPTION"),
          eq(orders.status, "success" as any),
          eq(orders.subscription, currentStatus),
        ),
      )
      .orderBy(drizzleDesc(orders.created_at))
      .limit(1);

    const expiry = (user.prime as any)?.expiry;

    if (!expiry) throw new Error("Expiry not found");
    const expiryDate = new Date(expiry);
    const today = new Date();
    const diffInDays = Math.floor(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      currentPlan: currentStatus,
      expiry: (user.prime as any)?.expiry,
      expiryInday: diffInDays,
      tierDetails: tier,
      lastPayment: lastPayment
        ? {
            amount: lastPayment.amount,
            date: lastPayment.created_at,
            orderId: lastPayment.id,
          }
        : null,
    };
  }
}

export const userService = new UserService();
