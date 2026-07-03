CREATE TABLE IF NOT EXISTS "users" (
  "userid" serial PRIMARY KEY NOT NULL,
  "firstname" varchar(255) DEFAULT '' NOT NULL,
  "lastname" varchar(255) DEFAULT '' NOT NULL,
  "groupid" smallint DEFAULT 1 NOT NULL,
  "created" timestamp with time zone DEFAULT now(),
  "email" varchar(255) DEFAULT '' NOT NULL,
  "avatar" text DEFAULT '',
  "birthday_month" smallint,
  "birthday_day" smallint
);

CREATE TABLE IF NOT EXISTS "items" (
  "itemid" serial PRIMARY KEY NOT NULL,
  "userid" integer NOT NULL,
  "name" varchar(500) DEFAULT '' NOT NULL,
  "description" text DEFAULT '',
  "link" text DEFAULT '',
  "added_by_userid" integer NOT NULL,
  "status_userid" integer,
  "groupid" smallint DEFAULT 1 NOT NULL,
  "status" varchar(50) DEFAULT 'no change',
  "removed" smallint DEFAULT 0 NOT NULL,
  "archive" smallint DEFAULT 0 NOT NULL,
  "date_added" timestamp with time zone DEFAULT now(),
  "date_received" varchar(20)
);

CREATE TABLE IF NOT EXISTS "item_notes" (
  "noteid" serial PRIMARY KEY NOT NULL,
  "itemid" integer NOT NULL,
  "userid" integer NOT NULL,
  "note" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "application_reports" (
  "id" serial PRIMARY KEY NOT NULL,
  "stid" varchar(36) NOT NULL,
  "userid" smallint,
  "report_type" varchar(20) NOT NULL,
  "component" varchar(255),
  "message" text,
  "timestamp" timestamp (3) with time zone DEFAULT now() NOT NULL,
  "performance_metrics" jsonb,
  "user_agent" text,
  "viewport_width" integer,
  "viewport_height" integer,
  "page_url" text,
  "referrer" text,
  "request_data" jsonb,
  "response_data" jsonb,
  "stack_trace" text,
  "metadata" jsonb
);
