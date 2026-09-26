ALTER TABLE "projects" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "outcome" text DEFAULT '' NOT NULL;