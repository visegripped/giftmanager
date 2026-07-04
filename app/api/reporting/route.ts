import { NextRequest, NextResponse } from 'next/server';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
  graphql,
} from 'graphql';
import {
  createReport,
  getReports,
  getReportStats,
  type ReportType,
} from '@/lib/reporting';

const reportTypeEnum = new GraphQLEnumType({
  name: 'ReportType',
  values: {
    PERFORMANCE: { value: 'performance' },
    INTERACTION: { value: 'interaction' },
    ERROR: { value: 'error' },
    WARNING: { value: 'warning' },
    INFO: { value: 'info' },
    DEBUG: { value: 'debug' },
  },
});

const reportType = new GraphQLObjectType({
  name: 'Report',
  fields: {
    id: { type: GraphQLInt },
    stid: { type: GraphQLString },
    userid: { type: GraphQLInt },
    report_type: { type: reportTypeEnum },
    component: { type: GraphQLString },
    message: { type: GraphQLString },
    timestamp: { type: GraphQLString },
    performance_metrics: { type: GraphQLString },
    user_agent: { type: GraphQLString },
    viewport_width: { type: GraphQLInt },
    viewport_height: { type: GraphQLInt },
    page_url: { type: GraphQLString },
    referrer: { type: GraphQLString },
    request_data: { type: GraphQLString },
    response_data: { type: GraphQLString },
    stack_trace: { type: GraphQLString },
    metadata: { type: GraphQLString },
  },
});

const reportFilterInput = new GraphQLInputObjectType({
  name: 'ReportFilter',
  fields: {
    userid: { type: GraphQLInt },
    report_type: { type: reportTypeEnum },
    component: { type: GraphQLString },
    stid: { type: GraphQLString },
    start_date: { type: GraphQLString },
    end_date: { type: GraphQLString },
  },
});

const paginationInput = new GraphQLInputObjectType({
  name: 'Pagination',
  fields: {
    limit: { type: GraphQLInt, defaultValue: 100 },
    offset: { type: GraphQLInt, defaultValue: 0 },
  },
});

const reportsResponseType = new GraphQLObjectType({
  name: 'ReportsResponse',
  fields: {
    reports: { type: new GraphQLList(reportType) },
    count: { type: GraphQLInt },
  },
});

const reportStatsType = new GraphQLObjectType({
  name: 'ReportStats',
  fields: {
    report_type: { type: reportTypeEnum },
    count: { type: GraphQLInt },
    unique_users: { type: GraphQLInt },
    unique_sessions: { type: GraphQLInt },
  },
});

const reportInputType = new GraphQLInputObjectType({
  name: 'ReportInput',
  fields: {
    stid: { type: new GraphQLNonNull(GraphQLString) },
    userid: { type: GraphQLInt },
    report_type: { type: new GraphQLNonNull(reportTypeEnum) },
    component: { type: GraphQLString },
    message: { type: GraphQLString },
    performance_metrics: { type: GraphQLString },
    user_agent: { type: GraphQLString },
    viewport_width: { type: GraphQLInt },
    viewport_height: { type: GraphQLInt },
    page_url: { type: GraphQLString },
    referrer: { type: GraphQLString },
    request_data: { type: GraphQLString },
    response_data: { type: GraphQLString },
    stack_trace: { type: GraphQLString },
    metadata: { type: GraphQLString },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      getReports: {
        type: reportsResponseType,
        args: {
          filter: { type: reportFilterInput },
          pagination: { type: paginationInput },
        },
        resolve: async (_root, args) => {
          return getReports(args.filter ?? {}, args.pagination ?? {});
        },
      },
      getReportStats: {
        type: new GraphQLList(reportStatsType),
        args: {
          filter: { type: reportFilterInput },
        },
        resolve: async (_root, args) => {
          return getReportStats(args.filter ?? {});
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createReport: {
        type: reportType,
        args: {
          input: { type: new GraphQLNonNull(reportInputType) },
        },
        resolve: async (_root, args) => {
          return createReport({
            ...args.input,
            report_type: args.input.report_type as ReportType,
          });
        },
      },
    },
  }),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await graphql({
      schema,
      source: body.query,
      variableValues: body.variables,
      operationName: body.operationName,
    });

    if (result.errors?.length) {
      console.error('GraphQL resolver errors:', result.errors);
    }

    return NextResponse.json(result, { headers: corsHeaders() });
  } catch (error) {
    console.error('GraphQL error:', error);
    return NextResponse.json(
      {
        data: null,
        errors: [
          { message: error instanceof Error ? error.message : 'Unknown error' },
        ],
      },
      { status: 200, headers: corsHeaders() }
    );
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json(
      { errors: [{ message: 'query parameter required' }] },
      { status: 400, headers: corsHeaders() }
    );
  }

  const result = await graphql({ schema, source: query });
  return NextResponse.json(result, { headers: corsHeaders() });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
