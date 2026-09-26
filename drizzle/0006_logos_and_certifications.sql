CREATE TABLE "certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"issuer" text DEFAULT '' NOT NULL,
	"issue_date" text,
	"expiry_date" text,
	"credential_id" text DEFAULT '' NOT NULL,
	"credential_url" text,
	"logo_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "logo_url" text;