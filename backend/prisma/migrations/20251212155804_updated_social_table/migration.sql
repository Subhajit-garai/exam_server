/*
  Warnings:

  - You are about to drop the column `facebook` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isContactVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isFacebookVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isGithubVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isInstagramVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isLinkedinVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isTelegramVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isTwitterVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `isWhatsappVerified` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `last_update` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `telegram` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `userid` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `Social` table. All the data in the column will be lost.
  - You are about to drop the column `socialId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,platform]` on the table `Social` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platform,link]` on the table `Social` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `link` to the `Social` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `Social` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Social` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Social` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('email', 'telegram', 'whatsApp', 'linkedIn', 'gitHub', 'twitter', 'instagram', 'facebook', 'website');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_socialId_fkey";

-- DropIndex
DROP INDEX "Social_id_key";

-- DropIndex
DROP INDEX "User_socialId_key";

-- AlterTable
ALTER TABLE "Social" DROP COLUMN "facebook",
DROP COLUMN "github",
DROP COLUMN "instagram",
DROP COLUMN "isContactVerified",
DROP COLUMN "isEmailVerified",
DROP COLUMN "isFacebookVerified",
DROP COLUMN "isGithubVerified",
DROP COLUMN "isInstagramVerified",
DROP COLUMN "isLinkedinVerified",
DROP COLUMN "isTelegramVerified",
DROP COLUMN "isTwitterVerified",
DROP COLUMN "isWhatsappVerified",
DROP COLUMN "last_update",
DROP COLUMN "linkedin",
DROP COLUMN "telegram",
DROP COLUMN "twitter",
DROP COLUMN "userid",
DROP COLUMN "website",
DROP COLUMN "whatsapp",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "platform" "SocialPlatform" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "socialId";

-- AlterTable
ALTER TABLE "botQuizConfig" ALTER COLUMN "check" SET DEFAULT 'Normal';

-- CreateIndex
CREATE UNIQUE INDEX "Social_userId_platform_key" ON "Social"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Social_platform_link_key" ON "Social"("platform", "link");

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
