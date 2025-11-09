<?php
/**
 * Reporting Functions
 * Functions to write reports to the application_reports database table
 */

/**
 * Create a report entry in the database
 * 
 * @param array $reportData Report data including:
 *   - stid: Session Transaction ID (required)
 *   - userid: User ID (optional)
 *   - report_type: Type of report (performance, interaction, error, warning, info, debug)
 *   - component: Component name that triggered the report
 *   - message: Report message
 *   - performance_metrics: JSON object with performance data
 *   - user_agent: User agent string
 *   - viewport_width: Viewport width
 *   - viewport_height: Viewport height
 *   - page_url: Current page URL
 *   - referrer: Referrer URL
 *   - request_data: JSON object with request data
 *   - response_data: JSON object with response data
 *   - stack_trace: Stack trace for errors
 *   - metadata: JSON object with additional metadata
 * @param mysqli $mysqli Database connection
 * @return array API response
 */
function createReport($reportData, $mysqli) {
    // Validate required fields
    if (empty($reportData['stid']) || empty($reportData['report_type'])) {
        return array(
            "error" => "Missing required fields: stid and report_type are required"
        );
    }

    // Validate report_type
    $validTypes = array('performance', 'interaction', 'error', 'warning', 'info', 'debug');
    if (!in_array($reportData['report_type'], $validTypes)) {
        return array(
            "error" => "Invalid report_type. Must be one of: " . implode(', ', $validTypes)
        );
    }

    // Prepare the SQL statement
    $query = "INSERT INTO application_reports (
        stid, userid, report_type, component, message, 
        performance_metrics, user_agent, viewport_width, viewport_height,
        page_url, referrer, request_data, response_data, stack_trace, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        return array(
            "error" => "Failed to prepare statement: (" . $mysqli->errno . ") " . $mysqli->error
        );
    }

    // Convert JSON fields to JSON strings
    $performance_metrics = isset($reportData['performance_metrics']) 
        ? json_encode($reportData['performance_metrics']) 
        : null;
    $request_data = isset($reportData['request_data']) 
        ? json_encode($reportData['request_data']) 
        : null;
    $response_data = isset($reportData['response_data']) 
        ? json_encode($reportData['response_data']) 
        : null;
    $metadata = isset($reportData['metadata']) 
        ? json_encode($reportData['metadata']) 
        : null;

    // Bind parameters
    $stmt->bind_param(
        'sisssssiissssss',
        $reportData['stid'],
        $reportData['userid'] ?? null,
        $reportData['report_type'],
        $reportData['component'] ?? null,
        $reportData['message'] ?? null,
        $performance_metrics,
        $reportData['user_agent'] ?? null,
        $reportData['viewport_width'] ?? null,
        $reportData['viewport_height'] ?? null,
        $reportData['page_url'] ?? null,
        $reportData['referrer'] ?? null,
        $request_data,
        $response_data,
        $reportData['stack_trace'] ?? null,
        $metadata
    );

    // Execute the statement
    if ($stmt->execute()) {
        $reportId = $mysqli->insert_id;
        $stmt->close();
        return array(
            "success" => "Report created successfully",
            "report_id" => $reportId
        );
    } else {
        $error = $stmt->error;
        $stmt->close();
        return array(
            "error" => "Failed to create report: " . $error
        );
    }
}

/**
 * Get reports from the database with filtering
 * 
 * @param array $filters Filter criteria:
 *   - userid: Filter by user ID
 *   - report_type: Filter by report type
 *   - component: Filter by component
 *   - stid: Filter by Session Transaction ID
 *   - start_date: Start date (YYYY-MM-DD HH:MM:SS)
 *   - end_date: End date (YYYY-MM-DD HH:MM:SS)
 *   - limit: Maximum number of results
 *   - offset: Offset for pagination
 * @param mysqli $mysqli Database connection
 * @return array API response with reports
 */
function getReports($filters, $mysqli) {
    $query = "SELECT * FROM application_reports WHERE 1=1";
    $params = array();
    $types = '';

    // Build WHERE clause dynamically
    if (isset($filters['id'])) {
        $query .= " AND id = ?";
        $params[] = $filters['id'];
        $types .= 'i';
    }

    if (isset($filters['userid'])) {
        $query .= " AND userid = ?";
        $params[] = $filters['userid'];
        $types .= 'i';
    }

    if (isset($filters['report_type'])) {
        $query .= " AND report_type = ?";
        $params[] = $filters['report_type'];
        $types .= 's';
    }

    if (isset($filters['component'])) {
        $query .= " AND component = ?";
        $params[] = $filters['component'];
        $types .= 's';
    }

    if (isset($filters['stid'])) {
        $query .= " AND stid = ?";
        $params[] = $filters['stid'];
        $types .= 's';
    }

    if (isset($filters['start_date'])) {
        $query .= " AND timestamp >= ?";
        $params[] = $filters['start_date'];
        $types .= 's';
    }

    if (isset($filters['end_date'])) {
        $query .= " AND timestamp <= ?";
        $params[] = $filters['end_date'];
        $types .= 's';
    }

    // Order by timestamp descending
    $query .= " ORDER BY timestamp DESC";

    // Add limit and offset if provided
    if (isset($filters['limit'])) {
        $limit = (int)$filters['limit'];
        $offset = isset($filters['offset']) ? (int)$filters['offset'] : 0;
        $query .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= 'ii';
    } else {
        // Default limit if not specified
        $query .= " LIMIT 100";
    }

    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        return array(
            "error" => "Failed to prepare statement: (" . $mysqli->errno . ") " . $mysqli->error
        );
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $reports = array();
    while ($row = $result->fetch_assoc()) {
        // Parse JSON fields
        if ($row['performance_metrics']) {
            $row['performance_metrics'] = json_decode($row['performance_metrics'], true);
        }
        if ($row['request_data']) {
            $row['request_data'] = json_decode($row['request_data'], true);
        }
        if ($row['response_data']) {
            $row['response_data'] = json_decode($row['response_data'], true);
        }
        if ($row['metadata']) {
            $row['metadata'] = json_decode($row['metadata'], true);
        }
        $reports[] = $row;
    }

    $stmt->close();

    return array(
        "success" => $reports,
        "count" => count($reports)
    );
}

/**
 * Get report statistics
 * 
 * @param array $filters Filter criteria (same as getReports)
 * @param mysqli $mysqli Database connection
 * @return array API response with statistics
 */
function getReportStats($filters, $mysqli) {
    $query = "SELECT 
        report_type,
        COUNT(*) as count,
        COUNT(DISTINCT userid) as unique_users,
        COUNT(DISTINCT stid) as unique_sessions
    FROM application_reports 
    WHERE 1=1";
    
    $params = array();
    $types = '';

    // Build WHERE clause (same as getReports)
    if (isset($filters['userid'])) {
        $query .= " AND userid = ?";
        $params[] = $filters['userid'];
        $types .= 'i';
    }

    if (isset($filters['component'])) {
        $query .= " AND component = ?";
        $params[] = $filters['component'];
        $types .= 's';
    }

    if (isset($filters['stid'])) {
        $query .= " AND stid = ?";
        $params[] = $filters['stid'];
        $types .= 's';
    }

    if (isset($filters['start_date'])) {
        $query .= " AND timestamp >= ?";
        $params[] = $filters['start_date'];
        $types .= 's';
    }

    if (isset($filters['end_date'])) {
        $query .= " AND timestamp <= ?";
        $params[] = $filters['end_date'];
        $types .= 's';
    }

    $query .= " GROUP BY report_type";

    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        return array(
            "error" => "Failed to prepare statement: (" . $mysqli->errno . ") " . $mysqli->error
        );
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $stats = array();
    while ($row = $result->fetch_assoc()) {
        $stats[] = $row;
    }

    $stmt->close();

    return array(
        "success" => $stats
    );
}

?>

