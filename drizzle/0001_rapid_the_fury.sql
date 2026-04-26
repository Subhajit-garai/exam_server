ALTER TABLE "events" ALTER COLUMN "conditions" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "conditions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "is_parent_topic" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "like" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "dislike" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "read_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "comments" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "is_public" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "verified" SET DEFAULT false;