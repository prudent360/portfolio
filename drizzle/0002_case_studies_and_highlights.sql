ALTER TABLE "projects" ADD COLUMN "body" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "highlights" jsonb DEFAULT '[]'::jsonb NOT NULL;