import prisma from "@repo/db/index.js";
import { z } from "zod";
import { DeleteSocialLinksInput, updateAcademicProfileZodSchema, updateSocialLinksZodSchema } from "../zod/user.zod.js";
import { SocialPlatform } from "@repo/prisma/enums.js";

type UpdateProfileInput = z.infer<typeof updateAcademicProfileZodSchema>;
type UpdateSocialLinksInput = z.infer<typeof updateSocialLinksZodSchema>;

SocialPlatform
export class ProfileService {
    async getProfile(userId: string) {
        let User = await prisma.user.findFirst({
            where: {
                id: userId,
            },
            select: {
                name: true,
                email: true,
                academicProfile: true,
                social: {
                    select: {
                        platform: true,
                        link: true,
                        isVerified: true,
                    },
                },
                school: true,
                standard: true,
                stream: true,
                balance: {
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
            },
        });

        if (!User) {
            throw new Error("User not found");
        }
        return User
    }
    async updateAcademicProfile(userId: string, data: UpdateProfileInput) {


        let updateData: any = {};
        // if (data.name) updateData.name = data.name; // name is not part of academic profile
        if (data.academicProfile) updateData.academicProfile = data.academicProfile;
        if (data.school) updateData.school = data.school;
        if (data.standard) updateData.standard = data.standard;
        if (data.stream) updateData.stream = data.stream;

        let category, exam, year;
        if (data.academicProfile) {
            category = data.academicProfile.category;
            exam = data.academicProfile.exam;
            year = data.academicProfile.year;
        }

        // here add user select  exam  , find that targeted exam and letest year and put those id in 
        if (exam) {
            const targetExam = await prisma.targetExam.findFirst({
                where: {
                    shortCode: exam
                }
            });

            if (targetExam) {
                updateData.targeted_exam_id = targetExam.id;

                if (year) {
                    const targetExamYear = await prisma.examYear.findFirst({
                        where: {
                            targetExamId: targetExam.id,
                            year: parseInt(year)
                        }
                    });

                    if (targetExamYear) {
                        updateData.exam_year_id = targetExamYear.id;
                    } else {

                        const latestExamYear = await prisma.examYear.findFirst({
                            where: {
                                targetExamId: targetExam.id,
                            },
                            orderBy: {
                                year: 'desc'
                            }
                        });

                        if (latestExamYear) {
                            updateData.exam_year_id = latestExamYear.id;
                        }




                    }
                }
            }
        }

        let updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: updateData,
            select: {
                name: true
            }
        });

        return updatedUser;
    }
    async updateSocialLinks(userId: string, data: UpdateSocialLinksInput) {

        if (data.link) {
            await prisma.social.upsert({
                where: {
                    userId_platform: {
                        userId: userId,
                        platform: data.platform
                    }
                },
                update: {
                    link: data.link
                },
                create: {
                    userId: userId,
                    platform: data.platform,
                    link: data.link
                }
            });
        }

        // Return the full profile again to be safe/consistent
        return this.getProfile(userId);
    }

    async deleteSocialLinksRecord(userId: string, data: DeleteSocialLinksInput) {

        await prisma.social.delete({
            where: {
                userId_platform: {
                    userId: userId,
                    platform: data.platform
                }
            }
        });

        return this.getProfile(userId);
    }
}
