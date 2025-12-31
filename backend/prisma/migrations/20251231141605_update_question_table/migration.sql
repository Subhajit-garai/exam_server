-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_topic_id_fkey";

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "topic_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avater" TEXT;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
