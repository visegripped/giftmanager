import { eq, and, desc, sql, count } from 'drizzle-orm';
import { getDb } from '../db';
import { applicationReports } from '../db/schema';

const VALID_TYPES = [
  'performance',
  'interaction',
  'error',
  'warning',
  'info',
  'debug',
] as const;

export type ReportType = (typeof VALID_TYPES)[number];

export interface ReportInput {
  stid: string;
  userid?: number | null;
  report_type: ReportType;
  component?: string | null;
  message?: string | null;
  performance_metrics?: string | Record<string, unknown> | null;
  user_agent?: string | null;
  viewport_width?: number | null;
  viewport_height?: number | null;
  page_url?: string | null;
  referrer?: string | null;
  request_data?: string | Record<string, unknown> | null;
  response_data?: string | Record<string, unknown> | null;
  stack_trace?: string | null;
  metadata?: string | Record<string, unknown> | null;
}

export interface ReportFilter {
  userid?: number;
  report_type?: ReportType;
  component?: string;
  stid?: string;
  start_date?: string;
  end_date?: string;
}

function parseJsonField(
  value: string | Record<string, unknown> | null | undefined
) {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export async function createReport(input: ReportInput) {
  if (!input.stid || !input.report_type) {
    throw new Error(
      'Missing required fields: stid and report_type are required'
    );
  }
  if (!VALID_TYPES.includes(input.report_type)) {
    throw new Error(
      `Invalid report_type. Must be one of: ${VALID_TYPES.join(', ')}`
    );
  }

  const db = getDb();
  const [row] = await db
    .insert(applicationReports)
    .values({
      stid: input.stid,
      userid: input.userid ?? null,
      reportType: input.report_type,
      component: input.component ?? null,
      message: input.message ?? null,
      performanceMetrics: parseJsonField(input.performance_metrics),
      userAgent: input.user_agent ?? null,
      viewportWidth: input.viewport_width ?? null,
      viewportHeight: input.viewport_height ?? null,
      pageUrl: input.page_url ?? null,
      referrer: input.referrer ?? null,
      requestData: parseJsonField(input.request_data),
      responseData: parseJsonField(input.response_data),
      stackTrace: input.stack_trace ?? null,
      metadata: parseJsonField(input.metadata),
    })
    .returning();

  return mapReportRow(row);
}

export async function getReports(
  filter: ReportFilter = {},
  pagination: { limit?: number; offset?: number } = {}
) {
  const db = getDb();
  const conditions = [];

  if (filter.userid != null) {
    conditions.push(eq(applicationReports.userid, filter.userid));
  }
  if (filter.report_type) {
    conditions.push(eq(applicationReports.reportType, filter.report_type));
  }
  if (filter.component) {
    conditions.push(eq(applicationReports.component, filter.component));
  }
  if (filter.stid) {
    conditions.push(eq(applicationReports.stid, filter.stid));
  }
  if (filter.start_date) {
    conditions.push(
      sql`${applicationReports.timestamp} >= ${filter.start_date}`
    );
  }
  if (filter.end_date) {
    conditions.push(sql`${applicationReports.timestamp} <= ${filter.end_date}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const limit = pagination.limit ?? 100;
  const offset = pagination.offset ?? 0;

  const rows = await db
    .select()
    .from(applicationReports)
    .where(whereClause)
    .orderBy(desc(applicationReports.timestamp))
    .limit(limit)
    .offset(offset);

  return {
    reports: rows.map(mapReportRow),
    count: rows.length,
  };
}

export async function getReportStats(filter: ReportFilter = {}) {
  const db = getDb();
  const conditions = [];

  if (filter.userid != null) {
    conditions.push(eq(applicationReports.userid, filter.userid));
  }
  if (filter.component) {
    conditions.push(eq(applicationReports.component, filter.component));
  }
  if (filter.stid) {
    conditions.push(eq(applicationReports.stid, filter.stid));
  }
  if (filter.start_date) {
    conditions.push(
      sql`${applicationReports.timestamp} >= ${filter.start_date}`
    );
  }
  if (filter.end_date) {
    conditions.push(sql`${applicationReports.timestamp} <= ${filter.end_date}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      report_type: applicationReports.reportType,
      count: count(),
      unique_users: sql<number>`COUNT(DISTINCT ${applicationReports.userid})::int`,
      unique_sessions: sql<number>`COUNT(DISTINCT ${applicationReports.stid})::int`,
    })
    .from(applicationReports)
    .where(whereClause)
    .groupBy(applicationReports.reportType);

  return rows;
}

function mapReportRow(row: typeof applicationReports.$inferSelect) {
  return {
    id: row.id,
    stid: row.stid,
    userid: row.userid,
    report_type: row.reportType,
    component: row.component,
    message: row.message,
    timestamp: row.timestamp?.toISOString() ?? null,
    performance_metrics: row.performanceMetrics
      ? JSON.stringify(row.performanceMetrics)
      : null,
    user_agent: row.userAgent,
    viewport_width: row.viewportWidth,
    viewport_height: row.viewportHeight,
    page_url: row.pageUrl,
    referrer: row.referrer,
    request_data: row.requestData ? JSON.stringify(row.requestData) : null,
    response_data: row.responseData ? JSON.stringify(row.responseData) : null,
    stack_trace: row.stackTrace,
    metadata: row.metadata ? JSON.stringify(row.metadata) : null,
  };
}
