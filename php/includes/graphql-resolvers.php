<?php
/**
 * GraphQL Resolvers for Reporting API
 */

require_once __DIR__ . '/reporting-functions.php';

/**
 * Get GraphQL resolvers
 * 
 * @return array Array of resolver functions
 */
function getGraphQLResolvers() {
    return [
        'getReports' => function($args, $mysqli) {
            $filters = isset($args['filter']) ? $args['filter'] : array();
            $pagination = isset($args['pagination']) ? $args['pagination'] : array();
            
            // Merge pagination into filters
            if (isset($pagination['limit'])) {
                $filters['limit'] = $pagination['limit'];
            }
            if (isset($pagination['offset'])) {
                $filters['offset'] = $pagination['offset'];
            }
            
            $result = getReports($filters, $mysqli);
            
            if (isset($result['error'])) {
                throw new Exception($result['error']);
            }
            
            return array(
                'reports' => $result['success'],
                'count' => $result['count']
            );
        },
        
        'getReportStats' => function($args, $mysqli) {
            $filters = isset($args['filter']) ? $args['filter'] : array();
            
            $result = getReportStats($filters, $mysqli);
            
            if (isset($result['error'])) {
                throw new Exception($result['error']);
            }
            
            return $result['success'];
        },
        
        'createReport' => function($input, $mysqli) {
            // Parse JSON strings back to arrays/objects for processing
            $reportData = $input;
            
            if (isset($reportData['performance_metrics']) && is_string($reportData['performance_metrics'])) {
                $reportData['performance_metrics'] = json_decode($reportData['performance_metrics'], true);
            }
            if (isset($reportData['request_data']) && is_string($reportData['request_data'])) {
                $reportData['request_data'] = json_decode($reportData['request_data'], true);
            }
            if (isset($reportData['response_data']) && is_string($reportData['response_data'])) {
                $reportData['response_data'] = json_decode($reportData['response_data'], true);
            }
            if (isset($reportData['metadata']) && is_string($reportData['metadata'])) {
                $reportData['metadata'] = json_decode($reportData['metadata'], true);
            }
            
            $result = createReport($reportData, $mysqli);
            
            if (isset($result['error'])) {
                throw new Exception($result['error']);
            }
            
            // Fetch the created report from database
            $reportId = $result['report_id'];
            $fetchResult = getReports(array('id' => $reportId), $mysqli);
            
            if (isset($fetchResult['error']) || empty($fetchResult['success'])) {
                // If we can't fetch it, return input with ID
                return array_merge($input, array('id' => $reportId));
            }
            
            return $fetchResult['success'][0];
        },
    ];
}

?>

