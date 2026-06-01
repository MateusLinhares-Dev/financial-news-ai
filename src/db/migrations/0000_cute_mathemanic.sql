CREATE TABLE "feed_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"content_json" jsonb NOT NULL,
	"generated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"topic" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "feed_cache" ADD CONSTRAINT "feed_cache_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;