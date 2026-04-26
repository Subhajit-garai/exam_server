CREATE TYPE "public"."ActivityType" AS ENUM('DAILY_CHALLENGE', 'QUIZ', 'TEST', 'DPP', 'MOCK', 'CHAPTER', 'STREAK_BONUS', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."BadgeRule" AS ENUM('ACTIVITY_COUNT', 'STREAK_COUNT', 'XP_THRESHOLD', 'TOPIC_MASTERY');--> statement-breakpoint
CREATE TYPE "public"."CreationTypes" AS ENUM('Updated', 'Created', 'Processing', 'Done', 'Suspended');--> statement-breakpoint
CREATE TYPE "public"."EventStatus" AS ENUM('completed', 'current', 'upcoming');--> statement-breakpoint
CREATE TYPE "public"."ExamScope" AS ENUM('NATIONAL', 'STATE', 'COLLEGE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."ExamStage" AS ENUM('Registration', 'Started', 'Ended');--> statement-breakpoint
CREATE TYPE "public"."ExamStatus" AS ENUM('REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'EVALUATION_IN_PROGRESS', 'RESULT_PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."ExamType" AS ENUM('Test', 'Contest', 'Mock', 'PYQ', 'Subject', 'Dpp', 'Quiz');--> statement-breakpoint
CREATE TYPE "public"."IssueType" AS ENUM('QUESTION', 'UI', 'EXAM', 'PAYMENT', 'LOGIN', 'SIGNUP');--> statement-breakpoint
CREATE TYPE "public"."OfferPlan" AS ENUM('BASIC', 'STANDARD', 'PREMIUM', 'PLATINUM');--> statement-breakpoint
CREATE TYPE "public"."Platform" AS ENUM('NONE', 'WEBAPP', 'ANDROIDAPP', 'TELEGRAM', 'WHATSAPP');--> statement-breakpoint
CREATE TYPE "public"."ProcessingStatus" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TYPE "public"."ProgressStatus" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."SocialPlatform" AS ENUM('email', 'telegram', 'whatsApp', 'linkedIn', 'gitHub', 'twitter', 'instagram', 'facebook', 'website');--> statement-breakpoint
CREATE TYPE "public"."Status" AS ENUM('Created', 'Processing', 'Done', 'Duplicate', 'Suspended', 'Close');--> statement-breakpoint
CREATE TYPE "public"."SyllabusType" AS ENUM('EXAM', 'QUIZ', 'TEST');--> statement-breakpoint
CREATE TYPE "public"."TopicStatus" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('Admin', 'User', 'Tutor', 'Bot');--> statement-breakpoint
CREATE TYPE "public"."Visibility" AS ENUM('Public', 'Private');--> statement-breakpoint
CREATE TYPE "public"."access_type" AS ENUM('Free', 'Paid');--> statement-breakpoint
CREATE TYPE "public"."ban_status" AS ENUM('Ban', 'UnBan', 'Block');--> statement-breakpoint
CREATE TYPE "public"."check" AS ENUM('Normal', 'Hybrid');--> statement-breakpoint
CREATE TYPE "public"."diffcultlevel" AS ENUM('Easy', 'Medium', 'Hard');--> statement-breakpoint
CREATE TYPE "public"."eventRuns" AS ENUM('ONE', 'DAILY', 'WEEKLY', 'MONTHLY');--> statement-breakpoint
CREATE TYPE "public"."eventType" AS ENUM('RUN_NEW_QUIZ', 'CREATE_QUIZ_CONTEST', 'SEND_MESSAGE', 'CREATE_DPP', 'CREATE_EXAM', 'CLEAR_BOT_CACHE', 'ACTIVITY_LEADERBOARD_ARCHIVE');--> statement-breakpoint
CREATE TYPE "public"."examformat" AS ENUM('Text', 'Image', 'Code');--> statement-breakpoint
CREATE TYPE "public"."primeStatus" AS ENUM('None', 'Bronze', 'Silver', 'Gold');--> statement-breakpoint
CREATE TYPE "public"."purchaseType" AS ENUM('SUBSCRIPTION', 'TOKEN');--> statement-breakpoint
CREATE TYPE "public"."quiz_type" AS ENUM('telegram_quiz', 'quiz');--> statement-breakpoint
CREATE TYPE "public"."syllabusType" AS ENUM('Generic', 'Syllabus');--> statement-breakpoint
CREATE TYPE "public"."telegramgroupType" AS ENUM('group', 'private', 'channel', 'supergroup');--> statement-breakpoint
CREATE TABLE "activity_leaderboards" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp (3) NOT NULL,
	"user_id" text NOT NULL,
	"rank" integer NOT NULL,
	"score" integer NOT NULL,
	"type" text DEFAULT 'daily' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"rule_type" "BadgeRule" NOT NULL,
	"condition" jsonb NOT NULL,
	"xp_bonus" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "badges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "daily_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp (3) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"xp" integer NOT NULL,
	"created_by" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "daily_challenges_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp (3) NOT NULL,
	"type" "ActivityType" NOT NULL,
	"meta" jsonb,
	"xp" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"user_id" text PRIMARY KEY NOT NULL,
	"streak" integer NOT NULL,
	"max_streak" integer NOT NULL,
	"last_activity" timestamp (3),
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_infos" (
	"id" text PRIMARY KEY NOT NULL,
	"bot_user_id" text NOT NULL,
	"token" text NOT NULL,
	"webhook" jsonb,
	CONSTRAINT "bot_infos_bot_user_id_unique" UNIQUE("bot_user_id")
);
--> statement-breakpoint
CREATE TABLE "bot_quiz_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"chat_id" text,
	"platform" "Platform" DEFAULT 'NONE' NOT NULL,
	"check" "check" DEFAULT 'Normal',
	"syllabus_id" text,
	"syllabus" "syllabusType" DEFAULT 'Syllabus' NOT NULL,
	"topics" text[] NOT NULL,
	"exam" text,
	"next_question_time" integer DEFAULT 40 NOT NULL,
	"quiz_open_for" integer DEFAULT 60 NOT NULL,
	"variable_delay" boolean NOT NULL,
	"shuffle_questions" boolean DEFAULT true NOT NULL,
	"total_questions" integer NOT NULL,
	"marks_value" integer DEFAULT 1 NOT NULL,
	"neg_value" integer NOT NULL,
	"is_multiple_answers" boolean NOT NULL,
	"waiting_time" integer DEFAULT 10 NOT NULL,
	"created_by" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "bot_quiz_configs_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "coupon_usages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"coupon_id" text NOT NULL,
	"used_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"discount_value" double precision NOT NULL,
	"max_uses" integer,
	"used_count" integer NOT NULL,
	"per_user_limit" integer,
	"min_order_amount" double precision,
	"expires_at" timestamp (3),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "eventType" NOT NULL,
	"description" text NOT NULL,
	"payload" jsonb NOT NULL,
	"conditions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" "UserRole" DEFAULT 'Bot' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"runs" "eventRuns" DEFAULT 'ONE' NOT NULL,
	"run_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_patterns" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"format" "examformat" DEFAULT 'Text' NOT NULL,
	"exam_name" text NOT NULL,
	"category_id" text,
	"syllabus" "syllabusType" DEFAULT 'Syllabus' NOT NULL,
	"syllabus_id" text,
	"topics" text[] NOT NULL,
	"difficulty" "diffcultlevel" DEFAULT 'Easy' NOT NULL,
	"part" boolean,
	"checkbox" boolean,
	"part_count" integer DEFAULT 1 NOT NULL,
	"total_questions" integer[] NOT NULL,
	"check" "check",
	"marks_values" integer[] NOT NULL,
	"neg_values" integer[] NOT NULL,
	"is_multiple_answers" integer[] DEFAULT '{0,0}' NOT NULL,
	"created_by" text,
	CONSTRAINT "exam_patterns_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "exam_years" (
	"id" text PRIMARY KEY NOT NULL,
	"target_exam_id" text NOT NULL,
	"year" integer NOT NULL,
	"slug" text NOT NULL,
	"status" "ExamStatus" DEFAULT 'SCHEDULED' NOT NULL,
	"is_public" boolean NOT NULL,
	"registration_open_date" timestamp (3),
	"registration_close_date" timestamp (3),
	"exam_date" timestamp (3),
	"result_date" timestamp (3),
	"notes" jsonb,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"is_deleted" boolean NOT NULL,
	CONSTRAINT "exam_years_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" text PRIMARY KEY NOT NULL,
	"display_id" text,
	"name" text DEFAULT 'No name',
	"examtype" "ExamType" DEFAULT 'Test' NOT NULL,
	"access_type" "access_type" DEFAULT 'Paid' NOT NULL,
	"exam_pattern_id" text NOT NULL,
	"is_multiple_attempts" boolean DEFAULT true NOT NULL,
	"is_live" boolean DEFAULT true NOT NULL,
	"visibility" "Visibility" DEFAULT 'Private' NOT NULL,
	"creationstatus" "CreationTypes" DEFAULT 'Processing' NOT NULL,
	"start_time" text DEFAULT '08:00 pm',
	"join_time" text DEFAULT '00:15 m',
	"duration" text DEFAULT '02:00 h' NOT NULL,
	"date" timestamp (3) DEFAULT now() NOT NULL,
	"stage" "ExamStage" DEFAULT 'Registration' NOT NULL,
	"register_id" text NOT NULL,
	"question_difficulty_weight" jsonb,
	"question_topic_count" jsonb,
	"question_part_count" jsonb,
	"created_at" timestamp (3) DEFAULT now(),
	"created_by" text,
	CONSTRAINT "exams_display_id_unique" UNIQUE("display_id")
);
--> statement-breakpoint
CREATE TABLE "target_exams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_code" text,
	"description" text,
	"exam_scope" "ExamScope" DEFAULT 'NATIONAL' NOT NULL,
	"is_public" boolean NOT NULL,
	"category_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "target_exams_name_unique" UNIQUE("name"),
	CONSTRAINT "target_exams_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "exam_timelines" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" timestamp (3) NOT NULL,
	"description" text,
	"status" "ExamStatus" NOT NULL,
	"notification" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"exam_year_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "IssueType" NOT NULL,
	"sub_type" text DEFAULT 'General',
	"note" text,
	"issue_details" jsonb NOT NULL,
	"status" "Status" DEFAULT 'Created' NOT NULL,
	"up_vote" integer NOT NULL,
	"down_vote" integer NOT NULL,
	"priority_vote" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"creator_role" "UserRole" DEFAULT 'User' NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"short_name" text,
	"description" text,
	"icon_url" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug"),
	CONSTRAINT "categories_short_name_unique" UNIQUE("short_name")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"description" text DEFAULT 'No description provided',
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"slug" text NOT NULL,
	"icon_url" text,
	"color" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"category" text NOT NULL,
	"category_id" text,
	"level" text,
	"difficulty" integer,
	CONSTRAINT "subjects_order_unique" UNIQUE("order"),
	CONSTRAINT "subjects_name_unique" UNIQUE("name"),
	CONSTRAINT "subjects_short_name_unique" UNIQUE("short_name"),
	CONSTRAINT "subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topic_note_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"content" text,
	"version" integer,
	"attachments" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject_id" text NOT NULL,
	"is_parent_topic" boolean NOT NULL,
	"parent_topic_id" text,
	"short_name" text,
	"order" integer DEFAULT 100 NOT NULL,
	"description" text DEFAULT 'No description provided',
	"slug" text NOT NULL,
	"icon_url" text,
	"color" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"content" text DEFAULT 'no content added ' NOT NULL,
	"like" integer NOT NULL,
	"dislike" integer NOT NULL,
	"read_count" integer NOT NULL,
	"comments" integer NOT NULL,
	"is_public" boolean NOT NULL,
	"comment_enabled" boolean DEFAULT true NOT NULL,
	"verified" boolean NOT NULL,
	"estimated_read_time" integer,
	"version" integer DEFAULT 100 NOT NULL,
	"attachments" text[] DEFAULT '{}' NOT NULL,
	"published_at" timestamp (3),
	"language" text,
	"status" "TopicStatus" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"created_by" text,
	"updated_by" text,
	CONSTRAINT "topics_name_unique" UNIQUE("name"),
	CONSTRAINT "topics_short_name_unique" UNIQUE("short_name"),
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscription_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"marked_price" integer NOT NULL,
	"discount" integer NOT NULL,
	"type" "purchaseType" NOT NULL,
	"title" text NOT NULL,
	"price" integer NOT NULL,
	"token" integer,
	"is_exam_based" boolean NOT NULL,
	"target_exam_id" text,
	"tier_id" text,
	"time" text,
	"offer_active" text[] DEFAULT '{}' NOT NULL,
	"offer_inactive" text[] DEFAULT '{}' NOT NULL,
	"btn_color" text NOT NULL,
	"created_by" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"razorpay_order_id" text NOT NULL,
	"amount" integer NOT NULL,
	"type" "purchaseType" DEFAULT 'TOKEN' NOT NULL,
	"token" integer,
	"subscription" "primeStatus" DEFAULT 'None',
	"coupon_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "orders_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"razorpay_order_id" text NOT NULL,
	"razorpay_payment_id" text NOT NULL,
	"razorpay_signature" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"user_id" text,
	CONSTRAINT "payments_razorpay_order_id_unique" UNIQUE("razorpay_order_id"),
	CONSTRAINT "payments_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id")
);
--> statement-breakpoint
CREATE TABLE "dpp_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"solved_count" integer NOT NULL,
	"questions_solved" integer NOT NULL,
	"last_dpp_id" text,
	"last_dpp_date" timestamp (3),
	"current_streak" integer NOT NULL,
	CONSTRAINT "dpp_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "exam_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"attended" integer NOT NULL,
	"total_questions_attempted" integer NOT NULL,
	"total_correct" integer NOT NULL,
	"accuracy" double precision NOT NULL,
	"last_exam_id" text,
	"last_exam_date" timestamp (3),
	"last_rank" integer NOT NULL,
	"best_rank" integer NOT NULL,
	CONSTRAINT "exam_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"attended" integer NOT NULL,
	"total_score" integer NOT NULL,
	"last_quiz_id" text,
	"last_quiz_date" timestamp (3),
	CONSTRAINT "quiz_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_topic_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"time_spent" integer NOT NULL,
	"status" "ProgressStatus" DEFAULT 'NOT_STARTED' NOT NULL,
	"last_read_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_maps" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"question_id" text NOT NULL,
	"part" text DEFAULT 'part1' NOT NULL,
	"exam_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"options" text[] NOT NULL,
	"old_topic" text NOT NULL,
	"old_sub_topic" text NOT NULL,
	"extra" jsonb,
	"ans" text[] NOT NULL,
	"topic_id" text,
	"subject_id" text NOT NULL,
	"format" "examformat" DEFAULT 'Text' NOT NULL,
	"category" text NOT NULL,
	"category_id" text,
	"difficulty" "diffcultlevel" NOT NULL,
	"is_multiple_answers" boolean NOT NULL,
	"history" text[] DEFAULT '{""}' NOT NULL,
	"explanation" text DEFAULT 'no explanation added',
	"links" text[] DEFAULT '{""}' NOT NULL,
	"status" "Status" DEFAULT 'Processing' NOT NULL,
	"weight" integer NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_processing" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"options" text[] NOT NULL,
	"old_topic" text,
	"old_sub_topic" text,
	"extra" jsonb,
	"ans" text[] NOT NULL,
	"topic_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"format" "examformat" DEFAULT 'Text' NOT NULL,
	"category" text NOT NULL,
	"difficulty" "diffcultlevel" NOT NULL,
	"is_multiple_answers" boolean NOT NULL,
	"history" text[] DEFAULT '{""}' NOT NULL,
	"explanation" text DEFAULT 'no explanation added',
	"links" text[] DEFAULT '{""}' NOT NULL,
	"status" "Status" DEFAULT 'Processing' NOT NULL,
	"weight" integer NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"question_id" text,
	"processing_status" "ProcessingStatus" DEFAULT 'Pending' NOT NULL,
	"admin_comment" text,
	"processed_by" text,
	"processed_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "quiz_question_maps" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"question_id" text NOT NULL,
	"quiz_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_registers" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text DEFAULT 'new_value_not_seted',
	"count" integer NOT NULL,
	"users" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "quiz_registers_quiz_id_unique" UNIQUE("quiz_id")
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" text PRIMARY KEY NOT NULL,
	"display_id" text,
	"quiz_register_id" text DEFAULT 'Private quiz',
	"is_need_registration" boolean NOT NULL,
	"name" text DEFAULT 'No name',
	"category" text NOT NULL,
	"topics" text[] DEFAULT '{""}' NOT NULL,
	"subjects" text[] DEFAULT '{""}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now(),
	"created_by" text DEFAULT 'No name' NOT NULL,
	"visibility" "Visibility" DEFAULT 'Private' NOT NULL,
	"creation_status" "CreationTypes" DEFAULT 'Processing' NOT NULL,
	"start_time" text DEFAULT '00:00 pm',
	"end_time" text DEFAULT '00:00 h' NOT NULL,
	"next_question_time" integer DEFAULT 40 NOT NULL,
	"quiz_open_for" integer DEFAULT 60 NOT NULL,
	"question_count" integer NOT NULL,
	"quiz_type" "quiz_type" DEFAULT 'quiz' NOT NULL,
	"chat_id" text,
	"date" timestamp (3) DEFAULT now() NOT NULL,
	"stage" "ExamStage" DEFAULT 'Registration' NOT NULL,
	CONSTRAINT "quizzes_display_id_unique" UNIQUE("display_id")
);
--> statement-breakpoint
CREATE TABLE "app_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"feature" text NOT NULL,
	"settings" jsonb NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "app_configs_feature_unique" UNIQUE("feature")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"topic_id" text NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_registers" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text DEFAULT 'new_value_not_seted',
	"count" integer NOT NULL,
	"users" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry_charge_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text DEFAULT 'not set' NOT NULL,
	"charge" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"exam_id" text NOT NULL,
	"rank" integer NOT NULL,
	"score" integer NOT NULL,
	"time" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"exam_id" text NOT NULL,
	"leaderboard_id" text NOT NULL,
	"not_attempt" integer,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"topic_wise_result" jsonb,
	"result" jsonb,
	"time" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timescale_scores" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"exam_id" text NOT NULL,
	"score" integer NOT NULL,
	"not_attempt" integer,
	"topic_wise_result" jsonb,
	"result" jsonb,
	"time" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "timescale_scores_cpk" PRIMARY KEY("id","time")
);
--> statement-breakpoint
CREATE TABLE "subject_syllabus_maps" (
	"id" text PRIMARY KEY NOT NULL,
	"syllabus_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"weightage" double precision,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syllabuses" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"type" "SyllabusType" DEFAULT 'EXAM' NOT NULL,
	"exam_year_id" text,
	"title" text NOT NULL,
	"description" text,
	CONSTRAINT "syllabuses_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "topic_subject_maps" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_map_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"weightage" double precision,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_ban_users" (
	"id" text PRIMARY KEY NOT NULL,
	"bot_id" text NOT NULL,
	"user_telegram_id" text NOT NULL,
	"ban_from_type" text NOT NULL,
	"ban_from_id" text NOT NULL,
	"status" "ban_status" DEFAULT 'Ban' NOT NULL,
	"at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_group_infos" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"group_name" text NOT NULL,
	"group_type" "telegramgroupType" DEFAULT 'group' NOT NULL,
	"group_link" text,
	"is_topic" boolean NOT NULL,
	"is_premium" boolean NOT NULL,
	"admin_ids" text[] NOT NULL,
	"is_banned" boolean NOT NULL,
	"last_active_at" timestamp (3),
	"message_count" integer NOT NULL,
	"quiz_count" integer NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"timezone" text,
	"features" jsonb,
	"group_status" text DEFAULT 'open',
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_group_infos_group_id_unique" UNIQUE("group_id")
);
--> statement-breakpoint
CREATE TABLE "telegram_group_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"topic_id" integer NOT NULL,
	"group_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tier_benefits" (
	"id" text PRIMARY KEY NOT NULL,
	"tier_id" text NOT NULL,
	"feature" "ExamType" NOT NULL,
	"access" boolean NOT NULL,
	"limit" integer,
	"used" integer,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" "primeStatus" NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "tiers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "balances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"ticket" integer NOT NULL,
	"last_update" timestamp (3) NOT NULL,
	CONSTRAINT "balances_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"type" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"seen" boolean NOT NULL,
	"seen_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "primes" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "primeStatus" DEFAULT 'None' NOT NULL,
	"user_id" text NOT NULL,
	"expiry_in_day" integer,
	"expiry" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "primes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "socials" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"platform" "SocialPlatform" NOT NULL,
	"link" text NOT NULL,
	"is_verified" boolean NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"part" text DEFAULT 'part1' NOT NULL,
	"exam_id" text NOT NULL,
	"user_id" text NOT NULL,
	"question_id" text DEFAULT 'not set' NOT NULL,
	"shuffle_map" integer[] NOT NULL,
	"selected_option" text[] NOT NULL,
	"is_correct" boolean,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avater" text,
	"email" text NOT NULL,
	"contact_no" text DEFAULT '0000000000',
	"password" text NOT NULL,
	"targeted_exam_id" text DEFAULT 'not set',
	"exam_year_id" text DEFAULT 'not set',
	"academic_profile" jsonb,
	"school" text,
	"standard" text,
	"stream" text,
	"role" "UserRole" DEFAULT 'User' NOT NULL,
	"join_at" timestamp (3) DEFAULT now() NOT NULL,
	"forgot_password_token" text,
	"reset_token_expires" timestamp (3) DEFAULT now() NOT NULL,
	"access_tokens" text[] DEFAULT '{}' NOT NULL,
	"is_online" boolean NOT NULL,
	"last_seen" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "related_topics" (
	"topic_a_id" text NOT NULL,
	"topic_b_id" text NOT NULL,
	CONSTRAINT "related_topics_topic_a_id_topic_b_id_pk" PRIMARY KEY("topic_a_id","topic_b_id")
);
--> statement-breakpoint
ALTER TABLE "activity_leaderboards" ADD CONSTRAINT "activity_leaderboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bot_infos" ADD CONSTRAINT "bot_infos_bot_user_id_users_id_fk" FOREIGN KEY ("bot_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bot_quiz_configs" ADD CONSTRAINT "bot_quiz_configs_syllabus_id_syllabuses_id_fk" FOREIGN KEY ("syllabus_id") REFERENCES "public"."syllabuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_quiz_configs" ADD CONSTRAINT "bot_quiz_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_patterns" ADD CONSTRAINT "exam_patterns_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_patterns" ADD CONSTRAINT "exam_patterns_syllabus_id_syllabuses_id_fk" FOREIGN KEY ("syllabus_id") REFERENCES "public"."syllabuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_patterns" ADD CONSTRAINT "exam_patterns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_years" ADD CONSTRAINT "exam_years_target_exam_id_target_exams_id_fk" FOREIGN KEY ("target_exam_id") REFERENCES "public"."target_exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_exam_pattern_id_exam_patterns_id_fk" FOREIGN KEY ("exam_pattern_id") REFERENCES "public"."exam_patterns"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_register_id_contest_registers_id_fk" FOREIGN KEY ("register_id") REFERENCES "public"."contest_registers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "target_exams" ADD CONSTRAINT "target_exams_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_timelines" ADD CONSTRAINT "exam_timelines_exam_year_id_exam_years_id_fk" FOREIGN KEY ("exam_year_id") REFERENCES "public"."exam_years"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "topic_note_versions" ADD CONSTRAINT "topic_note_versions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_topic_id_topics_id_fk" FOREIGN KEY ("parent_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_offers" ADD CONSTRAINT "subscription_offers_target_exam_id_target_exams_id_fk" FOREIGN KEY ("target_exam_id") REFERENCES "public"."target_exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_offers" ADD CONSTRAINT "subscription_offers_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "dpp_progress" ADD CONSTRAINT "dpp_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_progress" ADD CONSTRAINT "exam_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_progress" ADD CONSTRAINT "quiz_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_maps" ADD CONSTRAINT "question_maps_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_maps" ADD CONSTRAINT "question_maps_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_processing" ADD CONSTRAINT "question_processing_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_processing" ADD CONSTRAINT "question_processing_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_processing" ADD CONSTRAINT "question_processing_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_processing" ADD CONSTRAINT "question_processing_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_processing" ADD CONSTRAINT "question_processing_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_question_maps" ADD CONSTRAINT "quiz_question_maps_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quiz_question_maps" ADD CONSTRAINT "quiz_question_maps_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_quiz_register_id_quiz_registers_id_fk" FOREIGN KEY ("quiz_register_id") REFERENCES "public"."quiz_registers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "timescale_scores" ADD CONSTRAINT "timescale_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "timescale_scores" ADD CONSTRAINT "timescale_scores_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subject_syllabus_maps" ADD CONSTRAINT "subject_syllabus_maps_syllabus_id_syllabuses_id_fk" FOREIGN KEY ("syllabus_id") REFERENCES "public"."syllabuses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subject_syllabus_maps" ADD CONSTRAINT "subject_syllabus_maps_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "syllabuses" ADD CONSTRAINT "syllabuses_exam_year_id_exam_years_id_fk" FOREIGN KEY ("exam_year_id") REFERENCES "public"."exam_years"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "topic_subject_maps" ADD CONSTRAINT "topic_subject_maps_subject_map_id_subject_syllabus_maps_id_fk" FOREIGN KEY ("subject_map_id") REFERENCES "public"."subject_syllabus_maps"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "topic_subject_maps" ADD CONSTRAINT "topic_subject_maps_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "telegram_group_topics" ADD CONSTRAINT "telegram_group_topics_group_id_telegram_group_infos_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."telegram_group_infos"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tier_benefits" ADD CONSTRAINT "tier_benefits_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "primes" ADD CONSTRAINT "primes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "socials" ADD CONSTRAINT "socials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "related_topics" ADD CONSTRAINT "related_topics_topic_a_id_topics_id_fk" FOREIGN KEY ("topic_a_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "related_topics" ADD CONSTRAINT "related_topics_topic_b_id_topics_id_fk" FOREIGN KEY ("topic_b_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "activity_leaderboards_date_user_id_type_key" ON "activity_leaderboards" USING btree ("date","user_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges" USING btree ("user_id","badge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_usages_user_id_coupon_id_key" ON "coupon_usages" USING btree ("user_id","coupon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_subject_id_order_key" ON "topics" USING btree ("subject_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "user_topic_progress_user_id_topic_id_key" ON "user_topic_progress" USING btree ("user_id","topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_maps_exam_id_question_id_part_key" ON "question_maps" USING btree ("exam_id","question_id","part");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_question_maps_quiz_id_question_id_key" ON "quiz_question_maps" USING btree ("quiz_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "leaderboards_user_id_exam_id_time_key" ON "leaderboards" USING btree ("user_id","exam_id","time");--> statement-breakpoint
CREATE UNIQUE INDEX "scores_user_id_exam_id_time_key" ON "scores" USING btree ("user_id","exam_id","time");--> statement-breakpoint
CREATE UNIQUE INDEX "timescale_scores_user_id_exam_id_time_key" ON "timescale_scores" USING btree ("user_id","exam_id","time");--> statement-breakpoint
CREATE UNIQUE INDEX "subject_syllabus_maps_syllabus_id_subject_id_key" ON "subject_syllabus_maps" USING btree ("syllabus_id","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topic_subject_maps_subject_map_id_topic_id_key" ON "topic_subject_maps" USING btree ("subject_map_id","topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_ban_users_user_telegram_id_ban_from_id_key" ON "telegram_ban_users" USING btree ("user_telegram_id","ban_from_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tier_benefits_tier_id_feature_key" ON "tier_benefits" USING btree ("tier_id","feature");--> statement-breakpoint
CREATE UNIQUE INDEX "socials_user_id_platform_key" ON "socials" USING btree ("user_id","platform");--> statement-breakpoint
CREATE UNIQUE INDEX "socials_platform_link_key" ON "socials" USING btree ("platform","link");--> statement-breakpoint
CREATE UNIQUE INDEX "user_answers_exam_id_user_id_question_id_key" ON "user_answers" USING btree ("exam_id","user_id","question_id");