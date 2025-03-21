-- AlterTable
ALTER TABLE "Questions" ADD COLUMN     "history" TEXT[] DEFAULT ARRAY['']::TEXT[],
ADD COLUMN     "sub_topic" TEXT NOT NULL DEFAULT 'none';
