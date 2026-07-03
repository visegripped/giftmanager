-- GiftManager Postgres schema (local dev bootstrap)
-- Production schema is managed via Drizzle migrations

CREATE TABLE IF NOT EXISTS users (
  userid SERIAL PRIMARY KEY,
  firstname VARCHAR(255) NOT NULL DEFAULT '',
  lastname VARCHAR(255) NOT NULL DEFAULT '',
  groupid SMALLINT NOT NULL DEFAULT 1,
  created TIMESTAMPTZ DEFAULT NOW(),
  email VARCHAR(255) NOT NULL DEFAULT '',
  avatar TEXT DEFAULT '',
  birthday_month SMALLINT,
  birthday_day SMALLINT
);

CREATE TABLE IF NOT EXISTS items (
  itemid SERIAL PRIMARY KEY,
  userid INTEGER NOT NULL,
  name VARCHAR(500) NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  link TEXT DEFAULT '',
  added_by_userid INTEGER NOT NULL,
  status_userid INTEGER,
  groupid SMALLINT NOT NULL DEFAULT 1,
  status VARCHAR(50) DEFAULT 'no change',
  removed SMALLINT NOT NULL DEFAULT 0,
  archive SMALLINT NOT NULL DEFAULT 0,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  date_received VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS item_notes (
  noteid SERIAL PRIMARY KEY,
  itemid INTEGER NOT NULL,
  userid INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_reports (
  id SERIAL PRIMARY KEY,
  stid VARCHAR(36) NOT NULL,
  userid SMALLINT,
  report_type VARCHAR(20) NOT NULL,
  component VARCHAR(255),
  message TEXT,
  timestamp TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
  performance_metrics JSONB,
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  page_url TEXT,
  referrer TEXT,
  request_data JSONB,
  response_data JSONB,
  stack_trace TEXT,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_reports_stid ON application_reports(stid);
CREATE INDEX IF NOT EXISTS idx_reports_userid ON application_reports(userid);
CREATE INDEX IF NOT EXISTS idx_reports_type ON application_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON application_reports(timestamp);
