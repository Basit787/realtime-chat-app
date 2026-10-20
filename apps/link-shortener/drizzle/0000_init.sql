CREATE TABLE "clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"referrer" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"url" text NOT NULL,
	"title" varchar(200),
	"user_id" varchar(64) NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_link_id_created_at_idx" ON "clicks" USING btree ("link_id","created_at");--> statement-breakpoint
CREATE INDEX "links_user_id_idx" ON "links" USING btree ("user_id");