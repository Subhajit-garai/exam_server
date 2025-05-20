/*
  Warnings:

  - You are about to drop the column `question_subject_count` on the `mock_questions_set` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mock_questions_set" DROP COLUMN "question_subject_count",
ADD COLUMN     "question_topic_count" JSONB;
