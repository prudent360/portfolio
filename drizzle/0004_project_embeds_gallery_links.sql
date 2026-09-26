ALTER TABLE "projects" ADD COLUMN "embed_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "gallery" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "links" jsonb DEFAULT '[]'::jsonb NOT NULL;