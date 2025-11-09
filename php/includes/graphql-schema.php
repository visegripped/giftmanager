<?php
/**
 * GraphQL Schema Definition for Reporting API
 */

use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\EnumType;
use GraphQL\Type\Schema;

// Report Type Enum
$reportTypeEnum = new EnumType([
    'name' => 'ReportType',
    'description' => 'Type of report',
    'values' => [
        'PERFORMANCE' => ['value' => 'performance'],
        'INTERACTION' => ['value' => 'interaction'],
        'ERROR' => ['value' => 'error'],
        'WARNING' => ['value' => 'warning'],
        'INFO' => ['value' => 'info'],
        'DEBUG' => ['value' => 'debug'],
    ]
]);

// Report Type
$reportType = new ObjectType([
    'name' => 'Report',
    'description' => 'A single report entry',
    'fields' => [
        'id' => [
            'type' => Type::int(),
            'description' => 'Report ID'
        ],
        'stid' => [
            'type' => Type::string(),
            'description' => 'Session Transaction ID'
        ],
        'userid' => [
            'type' => Type::int(),
            'description' => 'User ID'
        ],
        'report_type' => [
            'type' => $reportTypeEnum,
            'description' => 'Type of report'
        ],
        'component' => [
            'type' => Type::string(),
            'description' => 'Component that triggered the report'
        ],
        'message' => [
            'type' => Type::string(),
            'description' => 'Report message'
        ],
        'timestamp' => [
            'type' => Type::string(),
            'description' => 'Timestamp of the report'
        ],
        'performance_metrics' => [
            'type' => Type::string(), // JSON string
            'description' => 'Performance metrics as JSON'
        ],
        'user_agent' => [
            'type' => Type::string(),
            'description' => 'User agent string'
        ],
        'viewport_width' => [
            'type' => Type::int(),
            'description' => 'Viewport width'
        ],
        'viewport_height' => [
            'type' => Type::int(),
            'description' => 'Viewport height'
        ],
        'page_url' => [
            'type' => Type::string(),
            'description' => 'Page URL'
        ],
        'referrer' => [
            'type' => Type::string(),
            'description' => 'Referrer URL'
        ],
        'request_data' => [
            'type' => Type::string(), // JSON string
            'description' => 'Request data as JSON'
        ],
        'response_data' => [
            'type' => Type::string(), // JSON string
            'description' => 'Response data as JSON'
        ],
        'stack_trace' => [
            'type' => Type::string(),
            'description' => 'Stack trace for errors'
        ],
        'metadata' => [
            'type' => Type::string(), // JSON string
            'description' => 'Additional metadata as JSON'
        ],
    ]
]);

// Report Filter Input
$reportFilterInput = new InputObjectType([
    'name' => 'ReportFilter',
    'description' => 'Filter criteria for reports',
    'fields' => [
        'userid' => [
            'type' => Type::int(),
            'description' => 'Filter by user ID'
        ],
        'report_type' => [
            'type' => $reportTypeEnum,
            'description' => 'Filter by report type'
        ],
        'component' => [
            'type' => Type::string(),
            'description' => 'Filter by component'
        ],
        'stid' => [
            'type' => Type::string(),
            'description' => 'Filter by Session Transaction ID'
        ],
        'start_date' => [
            'type' => Type::string(),
            'description' => 'Start date (YYYY-MM-DD HH:MM:SS)'
        ],
        'end_date' => [
            'type' => Type::string(),
            'description' => 'End date (YYYY-MM-DD HH:MM:SS)'
        ],
    ]
]);

// Pagination Input
$paginationInput = new InputObjectType([
    'name' => 'Pagination',
    'description' => 'Pagination parameters',
    'fields' => [
        'limit' => [
            'type' => Type::int(),
            'description' => 'Maximum number of results',
            'defaultValue' => 100
        ],
        'offset' => [
            'type' => Type::int(),
            'description' => 'Offset for pagination',
            'defaultValue' => 0
        ],
    ]
]);

// Reports Response Type
$reportsResponseType = new ObjectType([
    'name' => 'ReportsResponse',
    'description' => 'Response containing reports and count',
    'fields' => [
        'reports' => [
            'type' => Type::listOf($reportType),
            'description' => 'List of reports'
        ],
        'count' => [
            'type' => Type::int(),
            'description' => 'Number of reports returned'
        ],
    ]
]);

// Report Stats Type
$reportStatsType = new ObjectType([
    'name' => 'ReportStats',
    'description' => 'Report statistics',
    'fields' => [
        'report_type' => [
            'type' => $reportTypeEnum,
            'description' => 'Report type'
        ],
        'count' => [
            'type' => Type::int(),
            'description' => 'Number of reports of this type'
        ],
        'unique_users' => [
            'type' => Type::int(),
            'description' => 'Number of unique users'
        ],
        'unique_sessions' => [
            'type' => Type::int(),
            'description' => 'Number of unique sessions'
        ],
    ]
]);

// Report Input Type
$reportInputType = new InputObjectType([
    'name' => 'ReportInput',
    'description' => 'Input for creating a report',
    'fields' => [
        'stid' => [
            'type' => Type::nonNull(Type::string()),
            'description' => 'Session Transaction ID'
        ],
        'userid' => [
            'type' => Type::int(),
            'description' => 'User ID'
        ],
        'report_type' => [
            'type' => Type::nonNull($reportTypeEnum),
            'description' => 'Type of report'
        ],
        'component' => [
            'type' => Type::string(),
            'description' => 'Component that triggered the report'
        ],
        'message' => [
            'type' => Type::string(),
            'description' => 'Report message'
        ],
        'performance_metrics' => [
            'type' => Type::string(), // JSON string
            'description' => 'Performance metrics as JSON'
        ],
        'user_agent' => [
            'type' => Type::string(),
            'description' => 'User agent string'
        ],
        'viewport_width' => [
            'type' => Type::int(),
            'description' => 'Viewport width'
        ],
        'viewport_height' => [
            'type' => Type::int(),
            'description' => 'Viewport height'
        ],
        'page_url' => [
            'type' => Type::string(),
            'description' => 'Page URL'
        ],
        'referrer' => [
            'type' => Type::string(),
            'description' => 'Referrer URL'
        ],
        'request_data' => [
            'type' => Type::string(), // JSON string
            'description' => 'Request data as JSON'
        ],
        'response_data' => [
            'type' => Type::string(), // JSON string
            'description' => 'Response data as JSON'
        ],
        'stack_trace' => [
            'type' => Type::string(),
            'description' => 'Stack trace for errors'
        ],
        'metadata' => [
            'type' => Type::string(), // JSON string
            'description' => 'Additional metadata as JSON'
        ],
    ]
]);

// Query Type
$queryType = new ObjectType([
    'name' => 'Query',
    'description' => 'Query operations',
    'fields' => [
        'getReports' => [
            'type' => $reportsResponseType,
            'description' => 'Get reports with optional filtering and pagination',
            'args' => [
                'filter' => [
                    'type' => $reportFilterInput,
                    'description' => 'Filter criteria'
                ],
                'pagination' => [
                    'type' => $paginationInput,
                    'description' => 'Pagination parameters'
                ],
            ],
            'resolve' => function ($root, $args, $context) {
                return $context['resolvers']['getReports']($args, $context['mysqli']);
            }
        ],
        'getReportStats' => [
            'type' => Type::listOf($reportStatsType),
            'description' => 'Get report statistics',
            'args' => [
                'filter' => [
                    'type' => $reportFilterInput,
                    'description' => 'Filter criteria'
                ],
            ],
            'resolve' => function ($root, $args, $context) {
                return $context['resolvers']['getReportStats']($args, $context['mysqli']);
            }
        ],
    ]
]);

// Mutation Type
$mutationType = new ObjectType([
    'name' => 'Mutation',
    'description' => 'Mutation operations',
    'fields' => [
        'createReport' => [
            'type' => $reportType,
            'description' => 'Create a new report',
            'args' => [
                'input' => [
                    'type' => Type::nonNull($reportInputType),
                    'description' => 'Report data'
                ],
            ],
            'resolve' => function ($root, $args, $context) {
                return $context['resolvers']['createReport']($args['input'], $context['mysqli']);
            }
        ],
    ]
]);

// Create Schema
if (!isset($schema)) {
    $schema = new Schema([
        'query' => $queryType,
        'mutation' => $mutationType,
    ]);
}

