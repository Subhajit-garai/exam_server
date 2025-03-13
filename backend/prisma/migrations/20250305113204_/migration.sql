-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'User', 'Bot');

-- CreateEnum
CREATE TYPE "eventType" AS ENUM ('NEW_QUIZ_RUN', 'CREATE_QUIZ_CONTEST', 'SEND_MESSAGE');

-- CreateEnum
CREATE TYPE "eventRuns" AS ENUM ('ONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ExamStage" AS ENUM ('Registration', 'Started', 'Ended');

-- CreateEnum
CREATE TYPE "diffcultlevel" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "check" AS ENUM ('Normal', 'Hybrid');

-- CreateEnum
CREATE TYPE "primeStatus" AS ENUM ('none', 'bronze', 'silver', 'gold');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('Processing', 'Done', 'Duplicate', 'Suspended');

-- CreateEnum
CREATE TYPE "CreationTypes" AS ENUM ('Processing', 'Done', 'Suspended');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('Public', 'Private');

-- CreateEnum
CREATE TYPE "syllabusType" AS ENUM ('Generic', 'Syllabus');

-- CreateEnum
CREATE TYPE "examformate" AS ENUM ('Text', 'Image');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('Exam', 'Contest');

-- CreateTable
CREATE TABLE "botQuizTopic" (
    "id" TEXT NOT NULL,
    "quiztopic" TEXT[],
    "rapidtopic" TEXT[],
    "exam" TEXT NOT NULL,
    "question_count" TEXT NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "botQuizTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bottoken" (
    "id" TEXT NOT NULL,
    "token" TEXT[],

    CONSTRAINT "bottoken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timescale_score" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "not_attempt" INTEGER DEFAULT 0,
    "topic_wise_result" JSONB,
    "result" JSONB,
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timescale_score_pkey" PRIMARY KEY ("id","time")
);

-- CreateTable
CREATE TABLE "leaderboard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "exam_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "leaderboard_id" TEXT NOT NULL,
    "not_attempt" INTEGER DEFAULT 0,
    "score" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "topic_wise_result" JSONB,
    "result" JSONB,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "eventType" NOT NULL,
    "description" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "conditions" JSONB NOT NULL,
    "created_by" "UserRole" NOT NULL DEFAULT 'Bot',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runs" "eventRuns" NOT NULL DEFAULT 'ONE',
    "run_at" TEXT,
    "last_run_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryChargeList" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exam" INTEGER,
    "contest" INTEGER,
    "quiz" INTEGER,
    "created_by" TEXT,

    CONSTRAINT "EntryChargeList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT NOT NULL,
    "razorpay_signature" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactno" INTEGER DEFAULT 0,
    "password" TEXT NOT NULL,
    "primeid" TEXT NOT NULL,
    "telegramid" TEXT,
    "verificationid" TEXT,
    "progressid" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'User',
    "join_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forgotpasswordToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accesstoken" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "contactno" BOOLEAN NOT NULL DEFAULT false,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "telegram" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress" (
    "id" TEXT NOT NULL,
    "attempted" INTEGER NOT NULL DEFAULT 0,
    "attendedContest" INTEGER NOT NULL DEFAULT 0,
    "attendedQuiz" INTEGER NOT NULL DEFAULT 0,
    "attendedExam" INTEGER NOT NULL DEFAULT 0,
    "userid" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "inTopten" INTEGER NOT NULL DEFAULT 0,
    "accuracy" INTEGER NOT NULL DEFAULT 0,
    "topinexam" INTEGER NOT NULL DEFAULT 0,
    "topinContest" INTEGER NOT NULL DEFAULT 0,
    "openRegister" INTEGER NOT NULL DEFAULT 0,
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prime" (
    "id" TEXT NOT NULL,
    "userid" TEXT,
    "status" "primeStatus" NOT NULL DEFAULT 'none',
    "expiry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blance" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "ticket" INTEGER NOT NULL DEFAULT 0,
    "last_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram" (
    "id" TEXT NOT NULL,
    "userid" TEXT,
    "telegramid" INTEGER DEFAULT 0,
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "options" TEXT[],
    "ans" TEXT[],
    "formate" "examformate" NOT NULL DEFAULT 'Text',
    "category" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "explanation" TEXT DEFAULT 'no explanation added',
    "links" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "created_by" TEXT NOT NULL,
    "difficulty" "diffcultlevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "QuestionStatus" NOT NULL DEFAULT 'Processing',

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "examname" TEXT NOT NULL,
    "topics" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam_pattern" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "format" "examformate" NOT NULL DEFAULT 'Text',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "syllabus" "syllabusType" NOT NULL DEFAULT 'Syllabus',
    "topics" TEXT[],
    "difficulty" "diffcultlevel" NOT NULL DEFAULT 'Easy',
    "part" BOOLEAN,
    "checkbox" BOOLEAN,
    "part_Count" INTEGER NOT NULL DEFAULT 1,
    "total_questions" INTEGER[],
    "check" "check",
    "marks_values" INTEGER[],
    "neg_values" INTEGER[],
    "created_by" TEXT NOT NULL,

    CONSTRAINT "Exam_pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "display_id" TEXT,
    "name" TEXT DEFAULT 'No name',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "exam_pattern_id" TEXT NOT NULL,
    "examtype" "ExamType" NOT NULL DEFAULT 'Exam',
    "ansid" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'Private',
    "creationstatus" "CreationTypes" NOT NULL DEFAULT 'Processing',
    "starttime" TIMESTAMP(3),
    "timelimit" TIMESTAMP(3) NOT NULL,
    "jointime" TIMESTAMP(3),
    "stage" "ExamStage" NOT NULL DEFAULT 'Registration',

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestRegister" (
    "id" TEXT NOT NULL,
    "examId" TEXT DEFAULT 'new_value_not_seted',
    "users" TEXT[],

    CONSTRAINT "ContestRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnsSheet" (
    "id" TEXT NOT NULL,
    "ans" JSONB,
    "examId" TEXT,
    "status" "CreationTypes" NOT NULL DEFAULT 'Processing',

    CONSTRAINT "AnsSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAns" (
    "id" TEXT NOT NULL,
    "ans" JSONB NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserAns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam_user_attend_map" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Exam_user_attend_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam_pattern_map" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "exam_pattern_id" TEXT NOT NULL,

    CONSTRAINT "Exam_pattern_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam_Questions_map" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "questions_ids" TEXT NOT NULL,

    CONSTRAINT "Exam_Questions_map_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "botQuizTopic_id_key" ON "botQuizTopic"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bottoken_id_key" ON "bottoken"("id");

-- CreateIndex
CREATE INDEX "timescale_score_time_idx" ON "timescale_score"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "timescale_score_user_id_exam_id_time_key" ON "timescale_score"("user_id", "exam_id", "time");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_user_id_exam_id_key" ON "leaderboard"("user_id", "exam_id");

-- CreateIndex
CREATE INDEX "score_exam_id_idx" ON "score"("exam_id");

-- CreateIndex
CREATE INDEX "score_time_idx" ON "score"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "score_user_id_exam_id_key" ON "score"("user_id", "exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_feature_key" ON "AppConfig"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "events_id_key" ON "events"("id");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_runs_idx" ON "events"("runs");

-- CreateIndex
CREATE INDEX "events_run_at_idx" ON "events"("run_at");

-- CreateIndex
CREATE UNIQUE INDEX "EntryChargeList_id_key" ON "EntryChargeList"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpay_order_id_key" ON "Order"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_id_key" ON "payment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_razorpay_order_id_key" ON "payment"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_razorpay_payment_id_key" ON "payment"("razorpay_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_primeid_key" ON "User"("primeid");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramid_key" ON "User"("telegramid");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationid_key" ON "User"("verificationid");

-- CreateIndex
CREATE UNIQUE INDEX "User_progressid_key" ON "User"("progressid");

-- CreateIndex
CREATE UNIQUE INDEX "verification_id_key" ON "verification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_userid_key" ON "progress"("userid");

-- CreateIndex
CREATE INDEX "progress_userid_idx" ON "progress"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "prime_id_key" ON "prime"("id");

-- CreateIndex
CREATE UNIQUE INDEX "blance_id_key" ON "blance"("id");

-- CreateIndex
CREATE UNIQUE INDEX "blance_userid_key" ON "blance"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_id_key" ON "telegram"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Questions_id_key" ON "Questions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_id_key" ON "Syllabus"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_examname_key" ON "Syllabus"("examname");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_pattern_id_key" ON "Exam_pattern"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_id_key" ON "Exam"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_display_id_key" ON "Exam"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_ansid_key" ON "Exam"("ansid");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRegister_id_key" ON "ContestRegister"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRegister_examId_key" ON "ContestRegister"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "AnsSheet_id_key" ON "AnsSheet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAns_id_key" ON "UserAns"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_user_attend_map_id_key" ON "Exam_user_attend_map"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_pattern_map_id_key" ON "Exam_pattern_map"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_Questions_map_id_key" ON "Exam_Questions_map"("id");

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_primeid_fkey" FOREIGN KEY ("primeid") REFERENCES "prime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_telegramid_fkey" FOREIGN KEY ("telegramid") REFERENCES "telegram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verificationid_fkey" FOREIGN KEY ("verificationid") REFERENCES "verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blance" ADD CONSTRAINT "blance_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_pattern" ADD CONSTRAINT "Exam_pattern_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_ansid_fkey" FOREIGN KEY ("ansid") REFERENCES "AnsSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_exam_pattern_id_fkey" FOREIGN KEY ("exam_pattern_id") REFERENCES "Exam_pattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestRegister" ADD CONSTRAINT "ContestRegister_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_user_attend_map" ADD CONSTRAINT "Exam_user_attend_map_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_user_attend_map" ADD CONSTRAINT "Exam_user_attend_map_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_pattern_map" ADD CONSTRAINT "Exam_pattern_map_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_pattern_map" ADD CONSTRAINT "Exam_pattern_map_exam_pattern_id_fkey" FOREIGN KEY ("exam_pattern_id") REFERENCES "Exam_pattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_Questions_map" ADD CONSTRAINT "Exam_Questions_map_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_Questions_map" ADD CONSTRAINT "Exam_Questions_map_questions_ids_fkey" FOREIGN KEY ("questions_ids") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
