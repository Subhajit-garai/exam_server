/*
  Warnings:

  - You are about to drop the column `primeid` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userid]` on the table `prime` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userid` to the `prime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_primeid_fkey";

-- DropIndex
DROP INDEX "User_primeid_key";

-- DropIndex
DROP INDEX "progress_userid_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "primeid";

-- AlterTable
ALTER TABLE "prime" ADD COLUMN     "userid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "prime_userid_key" ON "prime"("userid");

-- AddForeignKey
ALTER TABLE "prime" ADD CONSTRAINT "prime_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
