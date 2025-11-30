import prisma from "@repo/db/index.js";
import { z } from "zod";
import { updateAcademicProfileZodSchema, updateSocialLinksZodSchema } from "../zod/user.zod.js";

type UpdateProfileInput = z.infer<typeof updateAcademicProfileZodSchema>;
type UpdateSocialLinksInput = z.infer<typeof updateSocialLinksZodSchema>;

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
                        telegram: true,
                        whatsapp: true,
                        github: true,
                        linkedin: true,
                        instagram: true,
                        facebook: true,
                        twitter: true,
                        isTelegramVerified: true,
                        isEmailVerified: true,
                        isWhatsappVerified: true,
                        isGithubVerified: true,
                        isLinkedinVerified: true,
                        isInstagramVerified: true,
                        isFacebookVerified: true,
                        isTwitterVerified: true,
                    },
                },
                school: true,
                standard: true,
                stream: true,
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
            },
        });

        if (!User) {
            throw new Error("user not exist");
        }


        return User;
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

        // Check if user has a social record
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { socialId: true }
        });

        if (!user) throw new Error("User not found");

        let socialId = user.socialId;
        let updateData: any = { ...data };

        if (socialId) {
            // Update existing social record
            await prisma.social.update({
                where: { id: socialId },
                data: updateData
            });
        } else {
            // Create new social record
            const newSocial = await prisma.social.create({
                data: {
                    ...updateData,
                    User: { connect: { id: userId } }
                }
            });

            // Link to user
            await prisma.user.update({
                where: { id: userId },
                data: { socialId: newSocial.id }
            });
        }

        let updatedUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                social: true
            }
        });

        return updatedUser;
    }
}
