/*
  Warnings:

  - You are about to drop the column `timelimit` on the `Exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "timelimit",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" TEXT NOT NULL DEFAULT '02:00 h',
ALTER COLUMN "starttime" SET DEFAULT '08:00 pm',
ALTER COLUMN "starttime" SET DATA TYPE TEXT,
ALTER COLUMN "jointime" SET DEFAULT '00:15 m';
