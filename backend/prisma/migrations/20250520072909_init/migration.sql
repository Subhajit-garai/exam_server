-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'User', 'Bot');

-- CreateEnum
CREATE TYPE "eventType" AS ENUM ('RUN_NEW_QUIZ', 'CREATE_QUIZ_CONTEST', 'SEND_MESSAGE', 'CREATE_DPP', 'CREATE_EXAM');

-- CreateEnum
CREATE TYPE "eventRuns" AS ENUM ('ONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('QUESTION', 'UI', 'EXAM', 'PAYMENT', 'LOGIN', 'SIGNUP');

-- CreateEnum
CREATE TYPE "primeStatus" AS ENUM ('none', 'bronze', 'silver', 'gold');

-- CreateEnum
CREATE TYPE "purchaseType" AS ENUM ('subcription', 'token');

-- CreateEnum
CREATE TYPE "ExamStage" AS ENUM ('Registration', 'Started', 'Ended');

-- CreateEnum
CREATE TYPE "diffcultlevel" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "check" AS ENUM ('Normal', 'Hybrid');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Created', 'Processing', 'Done', 'Duplicate', 'Suspended', 'Close');

-- CreateEnum
CREATE TYPE "CreationTypes" AS ENUM ('Processing', 'Done', 'Suspended');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('Public', 'Private');

-- CreateEnum
CREATE TYPE "syllabusType" AS ENUM ('Generic', 'Syllabus');

-- CreateEnum
CREATE TYPE "examformate" AS ENUM ('Text', 'Image', 'Code');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('Exam', 'Contest', 'Mock', 'Subject', 'Dpp', 'Quiz');

-- CreateTable
CREATE TABLE "copon" (
    "id" TEXT NOT NULL,
    "token" INTEGER NOT NULL DEFAULT 0,
    "count" INTEGER NOT NULL DEFAULT 0,
    "cupon" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessby" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "copon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "botQuizConfig" (
    "id" TEXT NOT NULL,
    "quiztopic" TEXT[],
    "rapidtopic" TEXT[],
    "exam" TEXT NOT NULL,
    "nextQuestionTime" INTEGER NOT NULL DEFAULT 40,
    "quizOpenFor" INTEGER NOT NULL DEFAULT 60,
    "question_count" TEXT NOT NULL DEFAULT '0',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "botQuizConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "botInfo" (
    "id" TEXT NOT NULL,
    "botuser_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "webhook" JSONB,

    CONSTRAINT "botInfo_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "type" "IssueType" NOT NULL,
    "note" TEXT,
    "IssueDetails" JSONB NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Created',
    "upVote" INTEGER NOT NULL DEFAULT 0,
    "downVote" INTEGER NOT NULL DEFAULT 0,
    "priorityVote" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator_role" "UserRole" NOT NULL DEFAULT 'User',
    "created_by" TEXT,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
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
    "run_at" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryChargeList" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exam" INTEGER,
    "contest" INTEGER,
    "quiz" INTEGER,
    "mock" INTEGER,
    "dpp" INTEGER,
    "subject" INTEGER,
    "created_by" TEXT,

    CONSTRAINT "EntryChargeList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubcriptionChargelist" (
    "id" TEXT NOT NULL,
    "gold" INTEGER,
    "bronze" INTEGER,
    "silver" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "SubcriptionChargelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcriptionOffers" (
    "id" TEXT NOT NULL,
    "markedPrice" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "type" "purchaseType" NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "token" INTEGER,
    "time" TEXT,
    "offerActive" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "offerInActive" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "btncolor" TEXT NOT NULL DEFAULT '',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subcriptionOffers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "type" "purchaseType" NOT NULL DEFAULT 'token',
    "amount" INTEGER NOT NULL,
    "token" INTEGER DEFAULT 0,
    "subcription" TEXT DEFAULT '',
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
    "contactno" TEXT DEFAULT '0000000000',
    "password" TEXT NOT NULL,
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
CREATE TABLE "prime" (
    "id" TEXT NOT NULL,
    "status" "primeStatus" NOT NULL DEFAULT 'none',
    "userid" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prime_pkey" PRIMARY KEY ("id")
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
    "lastExamid" TEXT NOT NULL DEFAULT 'not seted',
    "lastContestid" TEXT NOT NULL DEFAULT 'not seted',
    "lastQuizid" TEXT NOT NULL DEFAULT 'not seted',
    "lastExamRank" INTEGER NOT NULL DEFAULT 0,
    "lastContestRank" INTEGER NOT NULL DEFAULT 0,
    "lastQuizRank" INTEGER NOT NULL DEFAULT 0,
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
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
    "telegramid" TEXT DEFAULT '0000000000',
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "options" TEXT[],
    "extra" JSONB,
    "ans" TEXT[],
    "formate" "examformate" NOT NULL DEFAULT 'Text',
    "category" TEXT NOT NULL,
    "sub_topic" TEXT NOT NULL DEFAULT 'none',
    "history" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "topic" TEXT NOT NULL,
    "explanation" TEXT DEFAULT 'no explanation added',
    "links" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "is_multiple_ans" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "difficulty" "diffcultlevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'Processing',
    "weight" INTEGER NOT NULL DEFAULT 0,

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
    "is_multiple_ans" INTEGER[] DEFAULT ARRAY[0, 0]::INTEGER[],
    "created_by" TEXT NOT NULL,

    CONSTRAINT "Exam_pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_questions_set" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exam" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "questions" JSONB,
    "pattern" TEXT DEFAULT 'no exam pattern seted',
    "question_difficulty_weight" JSONB,
    "question_subject_count" JSONB,
    "question_part_count" JSONB,
    "status" "CreationTypes" NOT NULL DEFAULT 'Processing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_questions_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "display_id" TEXT,
    "name" TEXT DEFAULT 'No name',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "examtype" "ExamType" NOT NULL DEFAULT 'Exam',
    "mockSetId" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "exam_pattern_id" TEXT NOT NULL,
    "ansid" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'Private',
    "creationstatus" "CreationTypes" NOT NULL DEFAULT 'Processing',
    "starttime" TEXT DEFAULT '08:00 pm',
    "jointime" TEXT DEFAULT '00:15 m',
    "duration" TEXT NOT NULL DEFAULT '02:00 h',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" "ExamStage" NOT NULL DEFAULT 'Registration',
    "register_id" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestRegister" (
    "id" TEXT NOT NULL,
    "examId" TEXT DEFAULT 'new_value_not_seted',
    "count" INTEGER NOT NULL DEFAULT 0,
    "users" TEXT[] DEFAULT ARRAY[]::TEXT[],

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
CREATE TABLE "quiz" (
    "id" TEXT NOT NULL,
    "display_id" TEXT,
    "quizRegister_id" TEXT DEFAULT 'Private quiz',
    "name" TEXT DEFAULT 'No name',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'No name',
    "examtype" TEXT NOT NULL DEFAULT 'quiz',
    "ansid" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'Private',
    "creationstatus" "CreationTypes" NOT NULL DEFAULT 'Processing',
    "starttime" TEXT DEFAULT '08:00 pm',
    "duration" TEXT NOT NULL DEFAULT '02:00 h',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" "ExamStage" NOT NULL DEFAULT 'Registration',

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizRegister" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT DEFAULT 'new_value_not_seted',
    "count" INTEGER NOT NULL DEFAULT 0,
    "users" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "quizRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAns" (
    "id" TEXT NOT NULL,
    "ans" JSONB NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserAns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "copon_id_key" ON "copon"("id");

-- CreateIndex
CREATE UNIQUE INDEX "botQuizConfig_id_key" ON "botQuizConfig"("id");

-- CreateIndex
CREATE UNIQUE INDEX "botInfo_id_key" ON "botInfo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "botInfo_botuser_id_key" ON "botInfo"("botuser_id");

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
CREATE UNIQUE INDEX "Issue_id_key" ON "Issue"("id");

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
CREATE UNIQUE INDEX "SubcriptionChargelist_id_key" ON "SubcriptionChargelist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subcriptionOffers_id_key" ON "subcriptionOffers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_id_key" ON "Order"("order_id");

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
CREATE UNIQUE INDEX "User_telegramid_key" ON "User"("telegramid");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationid_key" ON "User"("verificationid");

-- CreateIndex
CREATE UNIQUE INDEX "User_progressid_key" ON "User"("progressid");

-- CreateIndex
CREATE UNIQUE INDEX "prime_id_key" ON "prime"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prime_userid_key" ON "prime"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "verification_id_key" ON "verification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_userid_key" ON "progress"("userid");

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
CREATE UNIQUE INDEX "mock_questions_set_id_key" ON "mock_questions_set"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_id_key" ON "Exam"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_display_id_key" ON "Exam"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_ansid_key" ON "Exam"("ansid");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRegister_id_key" ON "ContestRegister"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AnsSheet_id_key" ON "AnsSheet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_id_key" ON "quiz"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_display_id_key" ON "quiz"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_ansid_key" ON "quiz"("ansid");

-- CreateIndex
CREATE UNIQUE INDEX "quizRegister_id_key" ON "quizRegister"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quizRegister_quiz_id_key" ON "quizRegister"("quiz_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAns_id_key" ON "UserAns"("id");

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_telegramid_fkey" FOREIGN KEY ("telegramid") REFERENCES "telegram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verificationid_fkey" FOREIGN KEY ("verificationid") REFERENCES "verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prime" ADD CONSTRAINT "prime_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blance" ADD CONSTRAINT "blance_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_pattern" ADD CONSTRAINT "Exam_pattern_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "ContestRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_ansid_fkey" FOREIGN KEY ("ansid") REFERENCES "AnsSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_exam_pattern_id_fkey" FOREIGN KEY ("exam_pattern_id") REFERENCES "Exam_pattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_quizRegister_id_fkey" FOREIGN KEY ("quizRegister_id") REFERENCES "quizRegister"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_ansid_fkey" FOREIGN KEY ("ansid") REFERENCES "AnsSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
