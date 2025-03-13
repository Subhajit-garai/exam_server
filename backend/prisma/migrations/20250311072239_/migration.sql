/*
  Warnings:

  - You are about to drop the column `last_run_at` on the `events` table. All the data in the column will be lost.
  - Made the column `run_at` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "eventType" ADD VALUE 'CREATE_EXAM';

-- AlterTable
ALTER TABLE "events" DROP COLUMN "last_run_at",
ALTER COLUMN "run_at" SET NOT NULL;
