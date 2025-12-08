import { ExamType, Visibility } from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";

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
        // Delete from question_map
        // We might need to handle 'part' if a question can be in multiple parts, 
        // but typically a question is once per exam? 
        // Schema: @@unique([examid, questionid, part])
        // If we don't have part, we might delete all occurrences or fail?
        // Let's assume we delete all for this question in this exam for now, or request requires part.
        // For simplicity, let's try deleteMany or expect part in request if strict.
        // Given the requirement "removeQuestionFromMockQuestionSet", I'll use deleteMany for safety 
        // or findFirst then delete.

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
                        // might need resolved topics if syllabus is a type or relation
                        // Schema says: syllabus syllabusType @default(Syllabus)
                        // And topics String[]
                        topics: true
                    }
                }
            }
        });
        if (!response) throw new Error("Mock Set not found");
        return response.exam_pattern;
    }

    async getAvalibleMock() {
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

    async getMockQuestions(mockId: string) {

        const isMock = await prisma.exam.findFirst({
            where: {
                examtype: ExamType.Mock,
                id: mockId
            }
        })


        if (!isMock) {
            throw new CustomError("mock set not found ", 400)
        }
        const questions = await prisma.question_map.findMany({
            where: {
                examid: mockId
            }
        })

        return questions
    }
}
