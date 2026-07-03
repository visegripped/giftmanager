import {
  pgTable,
  serial,
  varchar,
  text,
  smallint,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  userid: serial('userid').primaryKey(),
  firstname: varchar('firstname', { length: 255 }).notNull().default(''),
  lastname: varchar('lastname', { length: 255 }).notNull().default(''),
  groupid: smallint('groupid').notNull().default(1),
  created: timestamp('created', { withTimezone: true }).defaultNow(),
  email: varchar('email', { length: 255 }).notNull().default(''),
  avatar: text('avatar').default(''),
  birthdayMonth: smallint('birthday_month'),
  birthdayDay: smallint('birthday_day'),
});

export const items = pgTable('items', {
  itemid: serial('itemid').primaryKey(),
  userid: integer('userid').notNull(),
  name: varchar('name', { length: 500 }).notNull().default(''),
  description: text('description').default(''),
  link: text('link').default(''),
  addedByUserid: integer('added_by_userid').notNull(),
  statusUserid: integer('status_userid'),
  groupid: smallint('groupid').notNull().default(1),
  status: varchar('status', { length: 50 }).default('no change'),
  removed: smallint('removed').notNull().default(0),
  archive: smallint('archive').notNull().default(0),
  dateAdded: timestamp('date_added', { withTimezone: true }).defaultNow(),
  dateReceived: varchar('date_received', { length: 20 }),
});

export const itemNotes = pgTable('item_notes', {
  noteid: serial('noteid').primaryKey(),
  itemid: integer('itemid').notNull(),
  userid: integer('userid').notNull(),
  note: text('note').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const applicationReports = pgTable('application_reports', {
  id: serial('id').primaryKey(),
  stid: varchar('stid', { length: 36 }).notNull(),
  userid: smallint('userid'),
  reportType: varchar('report_type', { length: 20 }).notNull(),
  component: varchar('component', { length: 255 }),
  message: text('message'),
  timestamp: timestamp('timestamp', { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  performanceMetrics: jsonb('performance_metrics'),
  userAgent: text('user_agent'),
  viewportWidth: integer('viewport_width'),
  viewportHeight: integer('viewport_height'),
  pageUrl: text('page_url'),
  referrer: text('referrer'),
  requestData: jsonb('request_data'),
  responseData: jsonb('response_data'),
  stackTrace: text('stack_trace'),
  metadata: jsonb('metadata'),
});

export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type ItemNote = typeof itemNotes.$inferSelect;
export type ApplicationReport = typeof applicationReports.$inferSelect;
