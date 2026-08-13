import { z } from "zod";
import {
  DeleteSocialLinksInput,
  updateAcademicProfileZodSchema,
  updateSocialLinksZodSchema,
} from "@/zod/user.zod.js";
import { db } from "@repo/db/index.js";
import { users, socials, primes, balances } from "@repo/db/schema/user.js";
import { target_exams, exam_years } from "@repo/db/schema/exam.js";
import { eq, and, desc as drizzleDesc } from "drizzle-orm";

type UpdateProfileInput = z.infer<typeof updateAcademicProfileZodSchema>;
type UpdateSocialLinksInput = z.infer<typeof updateSocialLinksZodSchema>;

export class ProfileService {
  async getProfile(userId: string) {
    const [userData] = await db
      .select({
        name: users.name,
        email: users.email,
        academic_profile: users.academic_profile,
        school: users.school,
        standard: users.standard,
        stream: users.stream,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData) {
      throw new Error("User not found");
    }

    const social = await db
      .select({
        platform: socials.platform,
        link: socials.link,
        is_verified: socials.is_verified,
      })
      .from(socials)
      .where(eq(socials.user_id, userId));

    const [balanceData] = await db
      .select({
        amount: balances.amount,
        ticket: balances.ticket,
      })
      .from(balances)
      .where(eq(balances.user_id, userId))
      .limit(1);

    const [primeData] = await db
      .select({
        status: primes.status,
      })
      .from(primes)
      .where(eq(primes.user_id, userId))
      .limit(1);

    return {
      ...userData,
      social,
      balance: balanceData,
      prime: primeData,
    };
  }

  async updateAcademicProfile(userId: string, data: UpdateProfileInput) {
    let updateData: any = {};
    if (data.academicProfile)
      updateData.academic_profile = data.academicProfile;
    if (data.school) updateData.school = data.school;
    if (data.standard) updateData.standard = data.standard;
    if (data.stream) updateData.stream = data.stream;

    let exam, year;
    if (data.academicProfile) {
      exam = data.academicProfile.exam;
      year = data.academicProfile.year;
    }

    if (exam) {
      const [targetExam] = await db
        .select()
        .from(target_exams)
        .where(eq(target_exams.short_code, exam))
        .limit(1);

      if (targetExam) {
        updateData.targeted_exam_id = targetExam.id;

        if (year) {
          const [targetExamYear] = await db
            .select()
            .from(exam_years)
            .where(
              and(
                eq(exam_years.target_exam_id, targetExam.id),
                eq(exam_years.year, parseInt(year)),
              ),
            )
            .limit(1);

          if (targetExamYear) {
            updateData.exam_year_id = targetExamYear.id;
          } else {
            const [latestExamYear] = await db
              .select()
              .from(exam_years)
              .where(eq(exam_years.target_exam_id, targetExam.id))
              .orderBy(drizzleDesc(exam_years.year))
              .limit(1);

            if (latestExamYear) {
              updateData.exam_year_id = latestExamYear.id;
            }
          }
        }
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
      })
      .where(eq(users.id, userId))
      .returning({ name: users.name });

    return updatedUser;
  }

  async updateSocialLinks(userId: string, data: UpdateSocialLinksInput) {
    if (data.link) {
      const [existingSocial] = await db
        .select()
        .from(socials)
        .where(
          and(
            eq(socials.user_id, userId),
            eq(socials.platform, data.platform as any),
          ),
        )
        .limit(1);

      if (existingSocial) {
        await db
          .update(socials)
          .set({
            link: data.link,
            updated_at: new Date(),
          })
          .where(eq(socials.id, existingSocial.id));
      } else {
        await db.insert(socials).values({
          user_id: userId,
          platform: data.platform as any,
          link: data.link,
          is_verified: false,
          updated_at: new Date(),
        });
      }
    }

    return this.getProfile(userId);
  }

  async deleteSocialLinksRecord(userId: string, data: DeleteSocialLinksInput) {
    const [existingSocial] = await db
      .select()
      .from(socials)
      .where(
        and(
          eq(socials.user_id, userId),
          eq(socials.platform, data.platform as any),
        ),
      )
      .limit(1);

    if (existingSocial) {
      await db.delete(socials).where(eq(socials.id, existingSocial.id));
    }

    return this.getProfile(userId);
  }
}
