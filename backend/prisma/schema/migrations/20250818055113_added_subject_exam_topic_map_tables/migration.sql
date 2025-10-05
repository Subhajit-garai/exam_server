/*
  Warnings:

  - You are about to drop the `target_exam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_target_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Syllabus" DROP CONSTRAINT "Syllabus_target_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subcriptionOffers" DROP CONSTRAINT "subcriptionOffers_target_exam_id_fkey";

-- AlterTable
ALTER TABLE "public"."TargetExam" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'not seted';

-- DropTable
DROP TABLE "public"."target_exam";

-- CreateTable
CREATE TABLE "public"."ExamSubjectMap" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "ExamSubjectMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamTopicMap" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "ExamTopicMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubjectMap_examId_subjectId_key" ON "public"."ExamSubjectMap"("examId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamTopicMap_examId_topicId_key" ON "public"."ExamTopicMap"("examId", "topicId");

-- AddForeignKey
ALTER TABLE "public"."ExamSubjectMap" ADD CONSTRAINT "ExamSubjectMap_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."TargetExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamSubjectMap" ADD CONSTRAINT "ExamSubjectMap_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamTopicMap" ADD CONSTRAINT "ExamTopicMap_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."TargetExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamTopicMap" ADD CONSTRAINT "ExamTopicMap_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subcriptionOffers" ADD CONSTRAINT "subcriptionOffers_target_exam_id_fkey" FOREIGN KEY ("target_exam_id") REFERENCES "public"."TargetExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Syllabus" ADD CONSTRAINT "Syllabus_target_exam_id_fkey" FOREIGN KEY ("target_exam_id") REFERENCES "public"."TargetExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
