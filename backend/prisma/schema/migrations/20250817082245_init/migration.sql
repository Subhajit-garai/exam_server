-- CreateEnum
CREATE TYPE "public"."ExamScope" AS ENUM ('NATIONAL', 'STATE', 'COLLEGE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ExamStatus" AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."purchaseType" AS ENUM ('subcription', 'token');

-- CreateEnum
CREATE TYPE "public"."quiz_type" AS ENUM ('telegram_quiz', 'quiz');

-- CreateEnum
CREATE TYPE "public"."TopicStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('Admin', 'User', 'Bot');

-- CreateEnum
CREATE TYPE "public"."primeStatus" AS ENUM ('None', 'Bronze', 'Silver', 'Gold');

-- CreateEnum
CREATE TYPE "public"."ExamStage" AS ENUM ('Registration', 'Started', 'Ended');

-- CreateEnum
CREATE TYPE "public"."diffcultlevel" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "public"."check" AS ENUM ('Normal', 'Hybrid');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('Created', 'Processing', 'Done', 'Duplicate', 'Suspended', 'Close');

-- CreateEnum
CREATE TYPE "public"."CreationTypes" AS ENUM ('Updated', 'Created', 'Processing', 'Done', 'Suspended');

-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('Public', 'Private');

-- CreateEnum
CREATE TYPE "public"."syllabusType" AS ENUM ('Generic', 'Syllabus');

-- CreateEnum
CREATE TYPE "public"."examformate" AS ENUM ('Text', 'Image', 'Code');

-- CreateEnum
CREATE TYPE "public"."ExamType" AS ENUM ('Exam', 'Contest', 'Mock', 'PYQ', 'Subject', 'Dpp', 'Quiz');

-- CreateEnum
CREATE TYPE "public"."eventType" AS ENUM ('RUN_NEW_QUIZ', 'CREATE_QUIZ_CONTEST', 'SEND_MESSAGE', 'CREATE_DPP', 'CREATE_EXAM', 'CLEAR_BOT_CACHE');

-- CreateEnum
CREATE TYPE "public"."eventRuns" AS ENUM ('ONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."IssueType" AS ENUM ('QUESTION', 'UI', 'EXAM', 'PAYMENT', 'LOGIN', 'SIGNUP');

-- CreateEnum
CREATE TYPE "public"."groupType" AS ENUM ('group', 'private', 'channel', 'supergroup');

-- CreateEnum
CREATE TYPE "public"."ban_status" AS ENUM ('Ban', 'UnBan', 'Block');

-- CreateTable
CREATE TABLE "public"."botQuizConfig" (
    "id" TEXT NOT NULL,
    "chatId" TEXT,
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
CREATE TABLE "public"."botInfo" (
    "id" TEXT NOT NULL,
    "botuser_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "webhook" JSONB,

    CONSTRAINT "botInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "type" "public"."eventType" NOT NULL,
    "description" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "conditions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_by" "public"."UserRole" NOT NULL DEFAULT 'Bot',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runs" "public"."eventRuns" NOT NULL DEFAULT 'ONE',
    "run_at" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TargetExam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT,
    "description" TEXT,
    "examType" "public"."ExamScope" NOT NULL DEFAULT 'NATIONAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TargetExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamYear" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "public"."ExamStatus" NOT NULL DEFAULT 'DRAFT',
    "registrationOpenDate" TIMESTAMP(3),
    "registrationCloseDate" TIMESTAMP(3),
    "examStartDate" TIMESTAMP(3),
    "examEndDate" TIMESTAMP(3),
    "resultDate" TIMESTAMP(3),
    "category" TEXT,
    "notes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "targetExamId" TEXT NOT NULL,

    CONSTRAINT "ExamYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."target_exam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'not updated ',
    "isOver" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exam_pattern" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "format" "public"."examformate" NOT NULL DEFAULT 'Text',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "syllabus" "public"."syllabusType" NOT NULL DEFAULT 'Syllabus',
    "topics" TEXT[],
    "difficulty" "public"."diffcultlevel" NOT NULL DEFAULT 'Easy',
    "part" BOOLEAN,
    "checkbox" BOOLEAN,
    "part_Count" INTEGER NOT NULL DEFAULT 1,
    "total_questions" INTEGER[],
    "check" "public"."check",
    "marks_values" INTEGER[],
    "neg_values" INTEGER[],
    "is_multiple_ans" INTEGER[] DEFAULT ARRAY[0, 0]::INTEGER[],
    "created_by" TEXT NOT NULL,

    CONSTRAINT "Exam_pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exam" (
    "id" TEXT NOT NULL,
    "display_id" TEXT,
    "name" TEXT DEFAULT 'No name',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "examtype" "public"."ExamType" NOT NULL DEFAULT 'Exam',
    "mockSetId" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "exam_pattern_id" TEXT NOT NULL,
    "ansid" TEXT NOT NULL,
    "Visibility" "public"."Visibility" NOT NULL DEFAULT 'Private',
    "creationstatus" "public"."CreationTypes" NOT NULL DEFAULT 'Processing',
    "starttime" TEXT DEFAULT '08:00 pm',
    "jointime" TEXT DEFAULT '00:15 m',
    "duration" TEXT NOT NULL DEFAULT '02:00 h',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isMultipleAttemp" BOOLEAN NOT NULL DEFAULT true,
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "stage" "public"."ExamStage" NOT NULL DEFAULT 'Registration',
    "register_id" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Issue" (
    "id" TEXT NOT NULL,
    "type" "public"."IssueType" NOT NULL,
    "sub_type" TEXT DEFAULT 'General',
    "note" TEXT,
    "IssueDetails" JSONB NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'Created',
    "upVote" INTEGER NOT NULL DEFAULT 0,
    "downVote" INTEGER NOT NULL DEFAULT 0,
    "priorityVote" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator_role" "public"."UserRole" NOT NULL DEFAULT 'User',
    "created_by" TEXT,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT DEFAULT 'No description provided',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "color" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL,
    "level" TEXT,
    "difficulty" INTEGER,
    "target_exam_id" TEXT,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TopicNoteVersion" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "content" TEXT,
    "version" INTEGER,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicNoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "isparentTopic" BOOLEAN NOT NULL DEFAULT false,
    "parentTopicId" TEXT,
    "shortName" TEXT,
    "order" INTEGER NOT NULL DEFAULT 100,
    "description" TEXT DEFAULT 'No description provided',
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "color" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content" TEXT NOT NULL DEFAULT 'no content added ',
    "like" INTEGER NOT NULL DEFAULT 0,
    "dislike" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "estimatedReadTime" INTEGER,
    "commentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 100,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "language" TEXT,
    "status" "public"."TopicStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subcriptionOffers" (
    "id" TEXT NOT NULL,
    "markedPrice" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "type" "public"."purchaseType" NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "token" INTEGER,
    "isExamBased" BOOLEAN NOT NULL DEFAULT false,
    "target_exam_id" TEXT,
    "tierId" TEXT,
    "time" TEXT,
    "offerActive" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "offerInActive" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "btncolor" TEXT NOT NULL DEFAULT '',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subcriptionOffers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coupon" (
    "id" TEXT NOT NULL,
    "token" INTEGER NOT NULL DEFAULT 0,
    "count" INTEGER NOT NULL DEFAULT 0,
    "cupon" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessby" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "type" "public"."purchaseType" NOT NULL DEFAULT 'token',
    "amount" INTEGER NOT NULL,
    "token" INTEGER DEFAULT 0,
    "subcription" TEXT DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment" (
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
CREATE TABLE "public"."Questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "options" TEXT[],
    "extra" JSONB,
    "ans" TEXT[],
    "formate" "public"."examformate" NOT NULL DEFAULT 'Text',
    "category" TEXT NOT NULL,
    "sub_topic" TEXT NOT NULL DEFAULT 'none',
    "history" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "topic" TEXT NOT NULL,
    "explanation" TEXT DEFAULT 'no explanation added',
    "links" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "is_multiple_ans" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" "public"."diffcultlevel" NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."Status" NOT NULL DEFAULT 'Processing',
    "weight" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mock_questions_set" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exam" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pattern" TEXT DEFAULT 'no exam pattern seted',
    "question_difficulty_weight" JSONB,
    "question_topic_count" JSONB,
    "question_part_count" JSONB,
    "total_questions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "selected_questions_count" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "status" "public"."CreationTypes" NOT NULL DEFAULT 'Processing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_questions_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_map" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "questionid" TEXT NOT NULL,
    "part" TEXT NOT NULL DEFAULT 'part1',
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ans" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "examid" TEXT,
    "isSuffled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mock_question_map" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "questionid" TEXT NOT NULL,
    "part" TEXT NOT NULL DEFAULT 'part1',
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ans" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mockid" TEXT,
    "isSuffled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_question_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz" (
    "id" TEXT NOT NULL,
    "display_id" TEXT,
    "quizRegister_id" TEXT DEFAULT 'Private quiz',
    "is_need_registration" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT DEFAULT 'No name',
    "category" TEXT NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'No name',
    "examtype" TEXT NOT NULL DEFAULT 'quiz',
    "Visibility" "public"."Visibility" NOT NULL DEFAULT 'Private',
    "creationstatus" "public"."CreationTypes" NOT NULL DEFAULT 'Processing',
    "starttime" TEXT DEFAULT '00:00 pm',
    "endtime" TEXT NOT NULL DEFAULT '00:00 h',
    "nextQuestionTime" INTEGER NOT NULL DEFAULT 40,
    "quizOpenFor" INTEGER NOT NULL DEFAULT 60,
    "question_count" TEXT NOT NULL DEFAULT '0',
    "quiz_type" "public"."quiz_type" NOT NULL DEFAULT 'quiz',
    "chatId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" "public"."ExamStage" NOT NULL DEFAULT 'Registration',

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz_question_map" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "questionid" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ans" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suffleKey" TEXT,
    "isSuffled" BOOLEAN NOT NULL DEFAULT false,
    "quizid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_question_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quizRegister" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT DEFAULT 'new_value_not_seted',
    "count" INTEGER NOT NULL DEFAULT 0,
    "users" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "quizRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntryChargeList" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'not set',
    "Charge" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "EntryChargeList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Syllabus" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "topics" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_exam_id" TEXT,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."telegram" (
    "id" TEXT NOT NULL,
    "userid" TEXT,
    "telegramid" TEXT DEFAULT '0000000000',
    "last_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContestRegister" (
    "id" TEXT NOT NULL,
    "examId" TEXT DEFAULT 'new_value_not_seted',
    "count" INTEGER NOT NULL DEFAULT 0,
    "users" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "ContestRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnsSheet" (
    "id" TEXT NOT NULL,
    "ans" JSONB,
    "examId" TEXT,
    "status" "public"."CreationTypes" NOT NULL DEFAULT 'Processing',

    CONSTRAINT "AnsSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAns" (
    "id" TEXT NOT NULL,
    "ans" JSONB NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserAns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AppConfig" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."timescale_score" (
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
CREATE TABLE "public"."score" (
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
CREATE TABLE "public"."leaderboard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "exam_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."telegramGroupInfo" (
    "id" TEXT NOT NULL,
    "groupid" TEXT NOT NULL,
    "groupname" TEXT NOT NULL,
    "groupType" "public"."groupType" NOT NULL DEFAULT 'group',
    "grouplink" TEXT,
    "isTopic" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "adminIds" TEXT[],
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "quizCount" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "features" JSONB,
    "groupstatus" TEXT DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegramGroupInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."telegramGroupTopic" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "telegramGroupTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."telegram_ban_user" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "user_telegram_id" TEXT NOT NULL,
    "ban_from_type" TEXT NOT NULL,
    "ban_from_id" TEXT NOT NULL,
    "status" "public"."ban_status" NOT NULL DEFAULT 'Ban',
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_ban_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tier" (
    "id" TEXT NOT NULL,
    "name" "public"."primeStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TierBenefit" (
    "id" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "feature" "public"."ExamType" NOT NULL,
    "access" BOOLEAN NOT NULL,
    "limit" INTEGER,
    "used" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TierBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactno" TEXT DEFAULT '0000000000',
    "password" TEXT NOT NULL,
    "telegramid" TEXT,
    "verificationid" TEXT,
    "progressid" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'User',
    "join_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forgotpasswordToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accesstoken" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prime" (
    "id" TEXT NOT NULL,
    "status" "public"."primeStatus" NOT NULL DEFAULT 'None',
    "userid" TEXT NOT NULL,
    "expiryInday" INTEGER DEFAULT 0,
    "expiry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "contactno" BOOLEAN NOT NULL DEFAULT false,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "telegram" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."progress" (
    "id" TEXT NOT NULL,
    "attempted" INTEGER NOT NULL DEFAULT 0,
    "attendedContest" INTEGER NOT NULL DEFAULT 0,
    "attendedQuiz" INTEGER NOT NULL DEFAULT 0,
    "attendedExam" INTEGER NOT NULL DEFAULT 0,
    "attendedMock" INTEGER NOT NULL DEFAULT 0,
    "attendedPYQ" INTEGER NOT NULL DEFAULT 0,
    "userid" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "inTopten" INTEGER NOT NULL DEFAULT 0,
    "accuracy" INTEGER NOT NULL DEFAULT 0,
    "topinexam" INTEGER NOT NULL DEFAULT 0,
    "topinContest" INTEGER NOT NULL DEFAULT 0,
    "openRegister" INTEGER NOT NULL DEFAULT 0,
    "lastExamid" TEXT NOT NULL DEFAULT 'not seted',
    "lastDppid" TEXT NOT NULL DEFAULT 'not seted',
    "lastMockid" TEXT NOT NULL DEFAULT 'not seted',
    "lastContestid" TEXT NOT NULL DEFAULT 'not seted',
    "lastQuizid" TEXT NOT NULL DEFAULT 'not seted',
    "lastExamRank" INTEGER NOT NULL DEFAULT 0,
    "lastDppRank" INTEGER NOT NULL DEFAULT 0,
    "lastMockRank" INTEGER NOT NULL DEFAULT 0,
    "lastContestRank" INTEGER NOT NULL DEFAULT 0,
    "lastQuizRank" INTEGER NOT NULL DEFAULT 0,
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blance" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "ticket" INTEGER NOT NULL DEFAULT 0,
    "last_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RelatedTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RelatedTopics_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "botQuizConfig_id_key" ON "public"."botQuizConfig"("id");

-- CreateIndex
CREATE UNIQUE INDEX "botInfo_id_key" ON "public"."botInfo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "botInfo_botuser_id_key" ON "public"."botInfo"("botuser_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_id_key" ON "public"."events"("id");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "public"."events"("type");

-- CreateIndex
CREATE INDEX "events_runs_idx" ON "public"."events"("runs");

-- CreateIndex
CREATE INDEX "events_run_at_idx" ON "public"."events"("run_at");

-- CreateIndex
CREATE UNIQUE INDEX "TargetExam_name_key" ON "public"."TargetExam"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TargetExam_shortCode_key" ON "public"."TargetExam"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "ExamYear_slug_key" ON "public"."ExamYear"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "target_exam_id_key" ON "public"."target_exam"("id");

-- CreateIndex
CREATE UNIQUE INDEX "target_exam_name_year_key" ON "public"."target_exam"("name", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_pattern_id_key" ON "public"."Exam_pattern"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_pattern_title_key" ON "public"."Exam_pattern"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_id_key" ON "public"."Exam"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_display_id_key" ON "public"."Exam"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_ansid_key" ON "public"."Exam"("ansid");

-- CreateIndex
CREATE INDEX "Exam_examtype_idx" ON "public"."Exam"("examtype");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_id_key" ON "public"."Issue"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_id_key" ON "public"."Subject"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_order_key" ON "public"."Subject"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "public"."Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_shortName_key" ON "public"."Subject"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "public"."Subject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_target_exam_id_key" ON "public"."Subject"("target_exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_id_key" ON "public"."Topic"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "public"."Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_shortName_key" ON "public"."Topic"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "public"."Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_subjectId_idx" ON "public"."Topic"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_order_key" ON "public"."Topic"("subjectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "subcriptionOffers_id_key" ON "public"."subcriptionOffers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_id_key" ON "public"."coupon"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_id_key" ON "public"."Order"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_id_key" ON "public"."payment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_razorpay_order_id_key" ON "public"."payment"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_razorpay_payment_id_key" ON "public"."payment"("razorpay_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Questions_id_key" ON "public"."Questions"("id");

-- CreateIndex
CREATE INDEX "Questions_topic_idx" ON "public"."Questions"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "mock_questions_set_id_key" ON "public"."mock_questions_set"("id");

-- CreateIndex
CREATE UNIQUE INDEX "mock_questions_set_name_key" ON "public"."mock_questions_set"("name");

-- CreateIndex
CREATE UNIQUE INDEX "question_map_id_key" ON "public"."question_map"("id");

-- CreateIndex
CREATE INDEX "question_map_examid_idx" ON "public"."question_map"("examid");

-- CreateIndex
CREATE UNIQUE INDEX "question_map_examid_questionid_part_key" ON "public"."question_map"("examid", "questionid", "part");

-- CreateIndex
CREATE UNIQUE INDEX "mock_question_map_id_key" ON "public"."mock_question_map"("id");

-- CreateIndex
CREATE INDEX "mock_question_map_mockid_idx" ON "public"."mock_question_map"("mockid");

-- CreateIndex
CREATE UNIQUE INDEX "mock_question_map_mockid_questionid_part_key" ON "public"."mock_question_map"("mockid", "questionid", "part");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_id_key" ON "public"."quiz"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_display_id_key" ON "public"."quiz"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_question_map_id_key" ON "public"."quiz_question_map"("id");

-- CreateIndex
CREATE INDEX "quiz_question_map_quizid_idx" ON "public"."quiz_question_map"("quizid");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_question_map_quizid_questionid_key" ON "public"."quiz_question_map"("quizid", "questionid");

-- CreateIndex
CREATE UNIQUE INDEX "quizRegister_id_key" ON "public"."quizRegister"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quizRegister_quiz_id_key" ON "public"."quizRegister"("quiz_id");

-- CreateIndex
CREATE UNIQUE INDEX "EntryChargeList_id_key" ON "public"."EntryChargeList"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_id_key" ON "public"."Syllabus"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_target_exam_id_key" ON "public"."Syllabus"("target_exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_id_key" ON "public"."telegram"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRegister_id_key" ON "public"."ContestRegister"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AnsSheet_id_key" ON "public"."AnsSheet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAns_id_key" ON "public"."UserAns"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_feature_key" ON "public"."AppConfig"("feature");

-- CreateIndex
CREATE INDEX "timescale_score_time_idx" ON "public"."timescale_score"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "timescale_score_user_id_exam_id_time_key" ON "public"."timescale_score"("user_id", "exam_id", "time");

-- CreateIndex
CREATE INDEX "score_exam_id_idx" ON "public"."score"("exam_id");

-- CreateIndex
CREATE INDEX "score_user_id_idx" ON "public"."score"("user_id");

-- CreateIndex
CREATE INDEX "score_time_idx" ON "public"."score"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "score_user_id_exam_id_time_key" ON "public"."score"("user_id", "exam_id", "time");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_user_id_exam_id_time_key" ON "public"."leaderboard"("user_id", "exam_id", "time");

-- CreateIndex
CREATE UNIQUE INDEX "telegramGroupInfo_id_key" ON "public"."telegramGroupInfo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "telegramGroupInfo_groupid_key" ON "public"."telegramGroupInfo"("groupid");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_ban_user_id_key" ON "public"."telegram_ban_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_ban_user_user_telegram_id_ban_from_id_key" ON "public"."telegram_ban_user"("user_telegram_id", "ban_from_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tier_name_key" ON "public"."Tier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TierBenefit_tierId_feature_key" ON "public"."TierBenefit"("tierId", "feature");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramid_key" ON "public"."User"("telegramid");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationid_key" ON "public"."User"("verificationid");

-- CreateIndex
CREATE UNIQUE INDEX "User_progressid_key" ON "public"."User"("progressid");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "prime_id_key" ON "public"."prime"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prime_userid_key" ON "public"."prime"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "verification_id_key" ON "public"."verification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_userid_key" ON "public"."progress"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "blance_id_key" ON "public"."blance"("id");

-- CreateIndex
CREATE UNIQUE INDEX "blance_userid_key" ON "public"."blance"("userid");

-- CreateIndex
CREATE INDEX "_RelatedTopics_B_index" ON "public"."_RelatedTopics"("B");

-- AddForeignKey
ALTER TABLE "public"."ExamYear" ADD CONSTRAINT "ExamYear_targetExamId_fkey" FOREIGN KEY ("targetExamId") REFERENCES "public"."TargetExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam_pattern" ADD CONSTRAINT "Exam_pattern_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "public"."ContestRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_ansid_fkey" FOREIGN KEY ("ansid") REFERENCES "public"."AnsSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_exam_pattern_id_fkey" FOREIGN KEY ("exam_pattern_id") REFERENCES "public"."Exam_pattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_target_exam_id_fkey" FOREIGN KEY ("target_exam_id") REFERENCES "public"."target_exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicNoteVersion" ADD CONSTRAINT "TopicNoteVersion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "public"."Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subcriptionOffers" ADD CONSTRAINT "subcriptionOffers_target_exam_id_fkey" FOREIGN KEY ("target_exam_id") REFERENCES "public"."target_exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subcriptionOffers" ADD CONSTRAINT "subcriptionOffers_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "public"."Tier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Questions" ADD CONSTRAINT "Questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_map" ADD CONSTRAINT "question_map_examid_fkey" FOREIGN KEY ("examid") REFERENCES "public"."Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mock_question_map" ADD CONSTRAINT "mock_question_map_mockid_fkey" FOREIGN KEY ("mockid") REFERENCES "public"."mock_questions_set"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz" ADD CONSTRAINT "quiz_quizRegister_id_fkey" FOREIGN KEY ("quizRegister_id") REFERENCES "public"."quizRegister"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz" ADD CONSTRAINT "quiz_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_question_map" ADD CONSTRAINT "quiz_question_map_quizid_fkey" FOREIGN KEY ("quizid") REFERENCES "public"."quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Syllabus" ADD CONSTRAINT "Syllabus_target_exam_id_fkey" FOREIGN KEY ("target_exam_id") REFERENCES "public"."target_exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leaderboard" ADD CONSTRAINT "leaderboard_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."telegramGroupTopic" ADD CONSTRAINT "telegramGroupTopic_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."telegramGroupInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TierBenefit" ADD CONSTRAINT "TierBenefit_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "public"."Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_telegramid_fkey" FOREIGN KEY ("telegramid") REFERENCES "public"."telegram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_verificationid_fkey" FOREIGN KEY ("verificationid") REFERENCES "public"."verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prime" ADD CONSTRAINT "prime_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blance" ADD CONSTRAINT "blance_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RelatedTopics" ADD CONSTRAINT "_RelatedTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RelatedTopics" ADD CONSTRAINT "_RelatedTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
