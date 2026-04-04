import { ExamType, Prisma, Visibility } from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { ExamManager } from "@/lib/manager/examManager.js";

const em = ExamManager.getInstance();

export class MockService {

    async getAllMock(userId: string) {
        // Fetch all exams of type Mock
        // Filter by user or public if needed, similar to getExams in exam.service
        const response = await prisma.exam.findMany({
            where: {
                examtype: ExamType.Mock,
                OR: [
                    { created_by: userId },
                    { Visibility: Visibility.Public }
                ]
            },
            include: {
                exam_pattern: {
                    include: {
                        Category: true
                    }
                },
                _count: {
                    select: { questionsMap: true }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        return response;
    }


    async refresh(mockid: string, userid: string) {
        return em.refresh(mockid, userid)
    }

    async selectRandomQuestion(mockid: string, userid: string) {
        return em.refresh(mockid, userid, "MOCK_PROCESSING")
    }

    async getMockById(id: string) {
        const response = await prisma.exam.findUnique({
            where: {
                examtype: ExamType.Mock,
                id: id,
            },
            include: {
                exam_pattern: {
                    include: {
                        Category: true
                    }
                },
                _count: {
                    select: { questionsMap: true }
                }
            }
        });

        if (!response) {
            throw new Error("Mock Question Set not found");
        }
        return response;
    }

    async getMockSetQuestions(mockId: string) {
        // Get questions mapped to this mock exam
        // Using question_map table
        const response = await prisma.question_map.findMany({
            where: {
                examid: mockId
            },
            include: {
                question: true
            },
            orderBy: {
                number: 'asc'
            }
        });
        return response;
    }

    async addQuestionToMock(mockId: string, questionId: string, part: string = "part1", number: number) {
        // Add question to question_map
        // Check if exists first to avoid dupes if unique constraint isn't enough or we want custom error

        // Use prisma create or upsert
        const response = await prisma.question_map.create({
            data: {
                examid: mockId,
                questionid: questionId,
                part: part,
                number: number
            }
        });
        return response;
    }

    async removeQuestionFromMock(mockId: string, questionId: string) {
        const response = await prisma.question_map.deleteMany({
            where: {
                examid: mockId,
                questionid: questionId
            }
        });
        return response;
    }

    async getExamPatterForMock(mockId: string) {
        const response = await prisma.exam.findUnique({
            where: { id: mockId },
            select: {
                exam_pattern: {
                    select: {
                        syllabus: true,
                        topics: true
                    }
                }
            }
        });
        if (!response) throw new Error("Mock Set not found");
        return response.exam_pattern;
    }

    async getAvailableMock() {
        // Maybe return just names and IDs for a dropdown
        const response = await prisma.exam.findMany({
            where: {
                examtype: ExamType.Mock,
                Visibility: Visibility.Public
                // Filter by status?
            },
            select: {
                id: true,
                name: true
            }
        });
        return response;
    }

    async getMockQuestions(mockId: string, info: "full" | "Onlyid") {

        const isMock = await prisma.exam.findFirst({
            where: {
                examtype: ExamType.Mock,
                id: mockId
            }
        })



        let questions: any

        if (!isMock) {
            throw new CustomError("mock set not found ", 400)
        }

        if (info === "Onlyid") {
            questions = await prisma.question_map.findMany({
                where: {
                    examid: mockId
                }
            })
        } else {
            questions = await prisma.question_map.findMany({
                where: {
                    examid: mockId
                },
                include: {
                    question: {
                        include: {
                            Topic: {
                                select: {
                                    name: true
                                }
                            },
                            Subject: {
                                select: {
                                    name: true
                                }
                            }
                        }

                    }
                }
            })
        }




        return questions
    }
}
