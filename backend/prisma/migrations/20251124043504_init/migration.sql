-- CreateEnum
CREATE TYPE "botPlatform" AS ENUM ('NONE', 'WEB', 'TELEGRAM', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "eventType" AS ENUM ('RUN_NEW_QUIZ', 'CREATE_QUIZ_CONTEST', 'SEND_MESSAGE', 'CREATE_DPP', 'CREATE_EXAM', 'CLEAR_BOT_CACHE');

-- CreateEnum
CREATE TYPE "eventRuns" AS ENUM ('ONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "access_type" AS ENUM ('Free', 'Paid');

-- CreateEnum
CREATE TYPE "ExamScope" AS ENUM ('NATIONAL', 'STATE', 'COLLEGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'EVALUATION_IN_PROGRESS', 'RESULT_PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('Test', 'Contest', 'Mock', 'PYQ', 'Subject', 'Dpp', 'Quiz');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('QUESTION', 'UI', 'EXAM', 'PAYMENT', 'LOGIN', 'SIGNUP');

-- CreateEnum
CREATE TYPE "OfferPlan" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'PLATINUM');

-- CreateEnum
CREATE TYPE "purchaseType" AS ENUM ('SUBSCRIPTION', 'TOKEN');

-- CreateEnum
CREATE TYPE "quiz_type" AS ENUM ('telegram_quiz', 'quiz');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ExamStage" AS ENUM ('Registration', 'Started', 'Ended');

-- CreateEnum
CREATE TYPE "diffcultlevel" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "check" AS ENUM ('Normal', 'Hybrid');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Created', 'Processing', 'Done', 'Duplicate', 'Suspended', 'Close');

-- CreateEnum
CREATE TYPE "CreationTypes" AS ENUM ('Updated', 'Created', 'Processing', 'Done', 'Suspended');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('Public', 'Private');

-- CreateEnum
CREATE TYPE "syllabusType" AS ENUM ('Generic', 'Syllabus');

-- CreateEnum
CREATE TYPE "examformat" AS ENUM ('Text', 'Image', 'Code');

-- CreateEnum
CREATE TYPE "SyllabusType" AS ENUM ('EXAM', 'QUIZ', 'TEST');

-- CreateEnum
CREATE TYPE "telegramgroupType" AS ENUM ('group', 'private', 'channel', 'supergroup');

-- CreateEnum
CREATE TYPE "ban_status" AS ENUM ('Ban', 'UnBan', 'Block');

-- CreateEnum
CREATE TYPE "primeStatus" AS ENUM ('None', 'Bronze', 'Silver', 'Gold');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'User', 'Tutor', 'Bot');

-- CreateTable
CREATE TABLE "botQuizConfig" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "chatId" TEXT,
    "platform" "botPlatform" NOT NULL DEFAULT 'NONE',
    "check" "check",
    "syllabusid" TEXT,
    "syllabus" "syllabusType" NOT NULL DEFAULT 'Syllabus',
    "topics" TEXT[],
    "exam" TEXT,
    "nextQuestionTime" INTEGER NOT NULL DEFAULT 40,
    "quizOpenFor" INTEGER NOT NULL DEFAULT 60,
    "variableDelay" BOOLEAN NOT NULL DEFAULT false,
    "suffleQuestions" BOOLEAN NOT NULL DEFAULT true,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "marks_values" INTEGER NOT NULL DEFAULT 1,
    "neg_values" INTEGER NOT NULL DEFAULT 0,
    "is_multiple_ans" BOOLEAN NOT NULL DEFAULT false,
    "waiting_time" INTEGER NOT NULL DEFAULT 10,
    "created_by" TEXT NOT NULL,
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
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER,
    "minOrderAmount" DOUBLE PRECISION,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "eventType" NOT NULL,
    "description" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "conditions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_by" "UserRole" NOT NULL DEFAULT 'Bot',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runs" "eventRuns" NOT NULL DEFAULT 'ONE',
    "run_at" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetExam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT,
    "description" TEXT,
    "examScope" "ExamScope" NOT NULL DEFAULT 'NATIONAL',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'not seted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamYear" (
    "id" TEXT NOT NULL,
    "targetExamId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'SCHEDULED',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "registrationOpenDate" TIMESTAMP(3),
    "registrationCloseDate" TIMESTAMP(3),
    "examDate" TIMESTAMP(3),
    "resultDate" TIMESTAMP(3),
    "notes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExamYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam_pattern" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "format" "examformat" NOT NULL DEFAULT 'Text',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "syllabus" "syllabusType" NOT NULL DEFAULT 'Syllabus',
    "syllabusid" TEXT,
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
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "display_id" TEXT,
    "name" TEXT DEFAULT 'No name',
    "examname" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "examtype" "ExamType" NOT NULL DEFAULT 'Test',
    "access_type" "access_type" NOT NULL DEFAULT 'Paid',
    "exam_pattern_id" TEXT NOT NULL,
    "isMultipleAttemp" BOOLEAN NOT NULL DEFAULT true,
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "Visibility" "Visibility" NOT NULL DEFAULT 'Private',
    "creationstatus" "CreationTypes" NOT NULL DEFAULT 'Processing',
    "starttime" TEXT DEFAULT '08:00 pm',
    "jointime" TEXT DEFAULT '00:15 m',
    "duration" TEXT NOT NULL DEFAULT '02:00 h',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" "ExamStage" NOT NULL DEFAULT 'Registration',
    "register_id" TEXT NOT NULL DEFAULT '',
    "question_difficulty_weight" JSONB,
    "question_topic_count" JSONB,
    "question_part_count" JSONB,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "type" "IssueType" NOT NULL,
    "sub_type" TEXT DEFAULT 'General',
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
CREATE TABLE "Subject" (
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

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicNoteVersion" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "content" TEXT,
    "version" INTEGER,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicNoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
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
    "commentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "estimatedReadTime" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 100,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishedAt" TIMESTAMP(3),
    "language" TEXT,
    "status" "TopicStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "purchaseType" NOT NULL DEFAULT 'TOKEN',
    "token" INTEGER DEFAULT 0,
    "subcription" "primeStatus" DEFAULT 'None',
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
CREATE TABLE "Questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "options" TEXT[],
    "old_topic" TEXT NOT NULL,
    "old_sub_topic" TEXT NOT NULL,
    "extra" JSONB,
    "ans" TEXT[],
    "topic_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "format" "examformat" NOT NULL DEFAULT 'Text',
    "category" TEXT NOT NULL,
    "difficulty" "diffcultlevel" NOT NULL,
    "is_multiple_ans" BOOLEAN NOT NULL DEFAULT false,
    "history" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "explanation" TEXT DEFAULT 'no explanation added',
    "links" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "status" "Status" NOT NULL DEFAULT 'Processing',
    "weight" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_map" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "questionid" TEXT NOT NULL,
    "part" TEXT NOT NULL DEFAULT 'part1',
    "examid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz" (
    "id" TEXT NOT NULL,
    "display_id" TEXT,
    "quizRegister_id" TEXT DEFAULT 'Private quiz',
    "is_need_registration" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT DEFAULT 'No name',
    "category" TEXT NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "subjects" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'No name',
    "Visibility" "Visibility" NOT NULL DEFAULT 'Private',
    "creationstatus" "CreationTypes" NOT NULL DEFAULT 'Processing',
    "starttime" TEXT DEFAULT '00:00 pm',
    "endtime" TEXT NOT NULL DEFAULT '00:00 h',
    "nextQuestionTime" INTEGER NOT NULL DEFAULT 40,
    "quizOpenFor" INTEGER NOT NULL DEFAULT 60,
    "question_count" INTEGER NOT NULL DEFAULT 0,
    "quiz_type" "quiz_type" NOT NULL DEFAULT 'quiz',
    "chatId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" "ExamStage" NOT NULL DEFAULT 'Registration',

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_question_map" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "questionid" TEXT NOT NULL,
    "quizid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_question_map_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "EntryChargeList" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'not set',
    "Charge" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "EntryChargeList_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "leaderboard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "exam_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "SyllabusType" NOT NULL DEFAULT 'EXAM',
    "exam_year_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectSyllabusMap" (
    "id" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "weightage" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectSyllabusMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicsSubjectMap" (
    "id" TEXT NOT NULL,
    "subject_map_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "weightage" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicsSubjectMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram" (
    "id" TEXT NOT NULL,
    "userid" TEXT,
    "telegramid" TEXT DEFAULT '0000000000',
    "last_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegramGroupInfo" (
    "id" TEXT NOT NULL,
    "groupid" TEXT NOT NULL,
    "groupname" TEXT NOT NULL,
    "groupType" "telegramgroupType" NOT NULL DEFAULT 'group',
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
CREATE TABLE "telegramGroupTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "telegramGroupTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_ban_user" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "user_telegram_id" TEXT NOT NULL,
    "ban_from_type" TEXT NOT NULL,
    "ban_from_id" TEXT NOT NULL,
    "status" "ban_status" NOT NULL DEFAULT 'Ban',
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_ban_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tier" (
    "id" TEXT NOT NULL,
    "name" "primeStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TierBenefit" (
    "id" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "feature" "ExamType" NOT NULL,
    "access" BOOLEAN NOT NULL,
    "limit" INTEGER,
    "used" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TierBenefit_pkey" PRIMARY KEY ("id")
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
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prime" (
    "id" TEXT NOT NULL,
    "status" "primeStatus" NOT NULL DEFAULT 'None',
    "userid" TEXT NOT NULL,
    "expiryInday" INTEGER DEFAULT 0,
    "expiry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "contactno" BOOLEAN NOT NULL DEFAULT false,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "telegram" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress" (
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
CREATE TABLE "blance" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "ticket" INTEGER NOT NULL DEFAULT 0,
    "last_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAns" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "part" TEXT NOT NULL DEFAULT 'part1',
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL DEFAULT 'not set',
    "shuffleMap" INTEGER[],
    "selectedOption" TEXT[],
    "isCorrect" BOOLEAN,

    CONSTRAINT "UserAns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "seenAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RelatedTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RelatedTopics_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "botQuizConfig_id_key" ON "botQuizConfig"("id");

-- CreateIndex
CREATE UNIQUE INDEX "botQuizConfig_title_key" ON "botQuizConfig"("title");

-- CreateIndex
CREATE UNIQUE INDEX "botInfo_id_key" ON "botInfo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "botInfo_botuser_id_key" ON "botInfo"("botuser_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_userId_couponId_key" ON "CouponUsage"("userId", "couponId");

-- CreateIndex
CREATE UNIQUE INDEX "events_id_key" ON "events"("id");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_runs_idx" ON "events"("runs");

-- CreateIndex
CREATE INDEX "events_run_at_idx" ON "events"("run_at");

-- CreateIndex
CREATE UNIQUE INDEX "TargetExam_name_key" ON "TargetExam"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TargetExam_shortCode_key" ON "TargetExam"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "ExamYear_slug_key" ON "ExamYear"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_pattern_id_key" ON "Exam_pattern"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_pattern_title_key" ON "Exam_pattern"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_id_key" ON "Exam"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_display_id_key" ON "Exam"("display_id");

-- CreateIndex
CREATE INDEX "Exam_examtype_idx" ON "Exam"("examtype");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_id_key" ON "Issue"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_id_key" ON "Subject"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_order_key" ON "Subject"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_shortName_key" ON "Subject"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_id_key" ON "Topic"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_shortName_key" ON "Topic"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_subjectId_idx" ON "Topic"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_subjectId_order_key" ON "Topic"("subjectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "subcriptionOffers_id_key" ON "subcriptionOffers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpay_order_id_key" ON "Order"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_id_key" ON "payment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_razorpay_order_id_key" ON "payment"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_razorpay_payment_id_key" ON "payment"("razorpay_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Questions_id_key" ON "Questions"("id");

-- CreateIndex
CREATE INDEX "Questions_topic_id_idx" ON "Questions"("topic_id");

-- CreateIndex
CREATE INDEX "Questions_subject_id_idx" ON "Questions"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_map_id_key" ON "question_map"("id");

-- CreateIndex
CREATE INDEX "question_map_examid_idx" ON "question_map"("examid");

-- CreateIndex
CREATE UNIQUE INDEX "question_map_examid_questionid_part_key" ON "question_map"("examid", "questionid", "part");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_id_key" ON "quiz"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_display_id_key" ON "quiz"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_question_map_id_key" ON "quiz_question_map"("id");

-- CreateIndex
CREATE INDEX "quiz_question_map_quizid_idx" ON "quiz_question_map"("quizid");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_question_map_quizid_questionid_key" ON "quiz_question_map"("quizid", "questionid");

-- CreateIndex
CREATE UNIQUE INDEX "quizRegister_id_key" ON "quizRegister"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quizRegister_quiz_id_key" ON "quizRegister"("quiz_id");

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_feature_key" ON "AppConfig"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "EntryChargeList_id_key" ON "EntryChargeList"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRegister_id_key" ON "ContestRegister"("id");

-- CreateIndex
CREATE INDEX "timescale_score_time_idx" ON "timescale_score"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "timescale_score_user_id_exam_id_time_key" ON "timescale_score"("user_id", "exam_id", "time");

-- CreateIndex
CREATE INDEX "score_exam_id_idx" ON "score"("exam_id");

-- CreateIndex
CREATE INDEX "score_user_id_idx" ON "score"("user_id");

-- CreateIndex
CREATE INDEX "score_time_idx" ON "score"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "score_user_id_exam_id_time_key" ON "score"("user_id", "exam_id", "time");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_user_id_exam_id_time_key" ON "leaderboard"("user_id", "exam_id", "time");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_id_key" ON "Syllabus"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_title_key" ON "Syllabus"("title");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectSyllabusMap_id_key" ON "SubjectSyllabusMap"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectSyllabusMap_syllabusId_subject_id_key" ON "SubjectSyllabusMap"("syllabusId", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "TopicsSubjectMap_id_key" ON "TopicsSubjectMap"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TopicsSubjectMap_subject_map_id_topic_id_key" ON "TopicsSubjectMap"("subject_map_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_id_key" ON "telegram"("id");

-- CreateIndex
CREATE UNIQUE INDEX "telegramGroupInfo_id_key" ON "telegramGroupInfo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "telegramGroupInfo_groupid_key" ON "telegramGroupInfo"("groupid");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_ban_user_id_key" ON "telegram_ban_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_ban_user_user_telegram_id_ban_from_id_key" ON "telegram_ban_user"("user_telegram_id", "ban_from_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tier_name_key" ON "Tier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TierBenefit_tierId_feature_key" ON "TierBenefit"("tierId", "feature");

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
CREATE INDEX "User_role_idx" ON "User"("role");

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
CREATE UNIQUE INDEX "UserAns_id_key" ON "UserAns"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAns_examId_userId_questionId_key" ON "UserAns"("examId", "userId", "questionId");

-- CreateIndex
CREATE INDEX "_RelatedTopics_B_index" ON "_RelatedTopics"("B");

-- AddForeignKey
ALTER TABLE "botQuizConfig" ADD CONSTRAINT "botQuizConfig_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "botInfo" ADD CONSTRAINT "botInfo_botuser_id_fkey" FOREIGN KEY ("botuser_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamYear" ADD CONSTRAINT "ExamYear_targetExamId_fkey" FOREIGN KEY ("targetExamId") REFERENCES "TargetExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_pattern" ADD CONSTRAINT "Exam_pattern_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "ContestRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_exam_pattern_id_fkey" FOREIGN KEY ("exam_pattern_id") REFERENCES "Exam_pattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicNoteVersion" ADD CONSTRAINT "TopicNoteVersion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcriptionOffers" ADD CONSTRAINT "subcriptionOffers_target_exam_id_fkey" FOREIGN KEY ("target_exam_id") REFERENCES "TargetExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcriptionOffers" ADD CONSTRAINT "subcriptionOffers_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_map" ADD CONSTRAINT "question_map_examid_fkey" FOREIGN KEY ("examid") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_map" ADD CONSTRAINT "question_map_questionid_fkey" FOREIGN KEY ("questionid") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_quizRegister_id_fkey" FOREIGN KEY ("quizRegister_id") REFERENCES "quizRegister"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question_map" ADD CONSTRAINT "quiz_question_map_quizid_fkey" FOREIGN KEY ("quizid") REFERENCES "quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question_map" ADD CONSTRAINT "quiz_question_map_questionid_fkey" FOREIGN KEY ("questionid") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_exam_year_id_fkey" FOREIGN KEY ("exam_year_id") REFERENCES "ExamYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSyllabusMap" ADD CONSTRAINT "SubjectSyllabusMap_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSyllabusMap" ADD CONSTRAINT "SubjectSyllabusMap_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicsSubjectMap" ADD CONSTRAINT "TopicsSubjectMap_subject_map_id_fkey" FOREIGN KEY ("subject_map_id") REFERENCES "SubjectSyllabusMap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicsSubjectMap" ADD CONSTRAINT "TopicsSubjectMap_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegramGroupTopic" ADD CONSTRAINT "telegramGroupTopic_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "telegramGroupInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierBenefit" ADD CONSTRAINT "TierBenefit_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_telegramid_fkey" FOREIGN KEY ("telegramid") REFERENCES "telegram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verificationid_fkey" FOREIGN KEY ("verificationid") REFERENCES "verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prime" ADD CONSTRAINT "prime_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blance" ADD CONSTRAINT "blance_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAns" ADD CONSTRAINT "UserAns_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedTopics" ADD CONSTRAINT "_RelatedTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedTopics" ADD CONSTRAINT "_RelatedTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;




--  time scale db setup


        -- Enable TimescaleDB extension
        CREATE EXTENSION IF NOT EXISTS timescaledb;
        -- Creating hyper tabele
        SELECT create_hypertable('timescale_score', by_range('time'));



        -- creating score _summart basd on day ,week ,month

-- hour ---> user_score_summary_day

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_minute'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_minute
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('10 minute', time) AS minute,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY minute, user_id
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'user_score_summary_minute',
    start_offset => INTERVAL '30 minute',
    end_offset => INTERVAL '5 minute',
    schedule_interval => INTERVAL '5 minute'
);





-- hour ---> user_score_summary_day

        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_hour'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_hour
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 hour', time) AS hour,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY hour, user_id
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'user_score_summary_hour',
    start_offset => INTERVAL '3 hour',
    end_offset => INTERVAL '30 minute',
    schedule_interval => INTERVAL '1 hour'
);


-- day ---> user_score_summary_day

        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_day'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_day
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 day', time) AS day,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY day, user_id
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'user_score_summary_day',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 day'
);


-- @@@@@@@@@@@@@@@
        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_week'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_week
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1week', time) AS week,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY week, user_id
        WITH NO DATA;
    END IF;
END $$;


SELECT add_continuous_aggregate_policy(
    'user_score_summary_week',
    start_offset => INTERVAL '3 week',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 week'
 );


 --@@@@@@@@@@@@@@@@@
        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_score_summary_month'
    ) THEN
        CREATE MATERIALIZED VIEW user_score_summary_month
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 month', time) AS month,
            user_id,
            SUM(score) AS total_score
        FROM timescale_score
        GROUP BY month, user_id
        WITH NO DATA;
    END IF;
END $$;
                SELECT add_continuous_aggregate_policy(
                    'user_score_summary_month',
                    start_offset => INTERVAL '3 month',
                    end_offset => INTERVAL '1 day',
                    schedule_interval => INTERVAL '1 month'
                 );

 -- creatin subject_score_summary based on day,week , month



DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_minute'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_minute
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('10 minute', time) AS minute,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right, 
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            minute, user_id, key
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'subject_score_summary_minute',
    start_offset => INTERVAL '30 minute',
    end_offset => INTERVAL '5 minute',
    schedule_interval => INTERVAL '5 minute'
);




-- hour ---> user_score_summary_day

        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_hour'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_hour
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 hour', time) AS hour,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right, 
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            hour, user_id, key
        WITH NO DATA;
    END IF;
END $$;



SELECT add_continuous_aggregate_policy(
    'subject_score_summary_hour',
    start_offset => INTERVAL '3 hour',
    end_offset => INTERVAL '30 minute',
    schedule_interval => INTERVAL '1 hour'
);


        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_day'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_day
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 day', time) AS day,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right, 
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            day, user_id, key
        WITH NO DATA;
    END IF;
END $$;

SELECT add_continuous_aggregate_policy(
    'subject_score_summary_day',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 day'
);


        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_week'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_week
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 week', time) AS week,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right,
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            week, user_id, key
        WITH NO DATA;
    END IF;
END $$;

SELECT add_continuous_aggregate_policy(
                    'subject_score_summary_week',
                    start_offset => INTERVAL '3 weeks',
                    end_offset => INTERVAL '1 hour',
                    schedule_interval => INTERVAL '1 week'
                 );



        DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'subject_score_summary_month'
    ) THEN
        
        CREATE MATERIALIZED VIEW subject_score_summary_month
        WITH (timescaledb.continuous) AS
        SELECT 
            time_bucket('1 month', time) AS month,
            user_id,
            key AS subject,
            SUM((value::jsonb ->> 'Right')::INTEGER) AS total_right,
            SUM((value::jsonb ->> 'Wrong')::INTEGER) AS total_wrong
        FROM 
            timescale_score,
            jsonb_each_text(topic_wise_result)
        GROUP BY 
            month, user_id, key
        WITH NO DATA;
    END IF;
END $$;

SELECT add_continuous_aggregate_policy(
                    'subject_score_summary_month',
                    start_offset => INTERVAL '3 months',
                    end_offset => INTERVAL '1 day',
                    schedule_interval => INTERVAL '1 month'
                 );

--  notification 




-- notify

CREATE OR REPLACE FUNCTION notify_event_change() RETURNS trigger AS $$
DECLARE
  action TEXT := TG_OP;  -- 'INSERT' or 'UPDATE'
BEGIN
  PERFORM pg_notify(
    'event_channel',
    json_build_object(
      'id', NEW.id,
      'action', action
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE  TRIGGER events_trigger
AFTER INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION notify_event_change();



-- rank tregger

CREATE OR REPLACE FUNCTION update_leaderboard_rank()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update leaderboard with highest score
  INSERT INTO leaderboard (id,user_id,exam_id,score,rank,time)
  VALUES (NEW.leaderboard_id,NEW.user_id, NEW.exam_id, NEW.score,0, now())
  ON CONFLICT (user_id, exam_id,time) DO UPDATE
  SET score = GREATEST(leaderboard.score, EXCLUDED.score),
      time = now();

  -- Update rank only if score has changed
  WITH ranked AS (
    SELECT user_id, exam_id, score,
           RANK() OVER (PARTITION BY exam_id ORDER BY score DESC) AS new_rank
    FROM leaderboard
  )
  UPDATE leaderboard l
  SET rank = r.new_rank
  FROM ranked r
  WHERE l.user_id = r.user_id 
    AND l.exam_id = r.exam_id 
    AND l.rank IS DISTINCT FROM r.new_rank;  -- Avoid unnecessary updates

	-- part 2
	INSERT INTO timescale_score (id,user_id, exam_id, score,not_attempt,topic_wise_result,result,time)
  VALUES (NEW.id,NEW.user_id, NEW.exam_id, NEW.score,NEW.not_attempt,NEW.topic_wise_result,NEW.result, NEW.time)
  ON CONFLICT (id, time) DO UPDATE
	  SET score = EXCLUDED.score, 
	      not_attempt = EXCLUDED.not_attempt,
	      topic_wise_result = EXCLUDED.topic_wise_result,
	      result = EXCLUDED.result;
	

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- tregger

CREATE OR REPLACE TRIGGER trigger_update_leaderboard_rank
AFTER INSERT OR UPDATE ON score
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_rank();







