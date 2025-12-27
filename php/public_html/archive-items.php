<?php
/**
 * CRON script to archive items based on delivery dates and removal status
 * 
 * This script should be run daily via CRON:
 * 0 0 * * * /usr/bin/php /path/to/archive-items.php
 * 
 * Logic:
 * 1. Archive items where date_received < current date AND archive = 0
 * 2. Archive items where removed = 1 AND status NOT IN ('reserved', 'purchased') AND archive = 0
 * 3. Archive items where removed = 1 AND status = 'purchased' AND date_received < current date AND archive = 0
 */

// Suppress error output for CRON execution
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Set timezone
date_default_timezone_set('UTC');

// Include database credentials (always from root includes folder, never versioned)
require_once __DIR__ . '/../includes/current_version.php';
include gm_get_credentials_path('api-credentials.php');

// Support Docker environment (use DB_HOST from env, fallback to localhost)
$dbHost = gmGetEnv('DB_HOST') ?: 'localhost';
$mysqli = new mysqli($dbHost, $username, $password, $database);

// Check connection
if ($mysqli->connect_errno) {
    error_log("Archive Items CRON: Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
    exit(1);
}

$currentDate = date('Y-m-d');
$totalArchived = 0;
$errors = [];

// 1. Archive items where date_received < current date AND archive = 0
$query1 = "UPDATE items SET archive = 1 WHERE date_received < ? AND date_received != '0000-00-00' AND archive = 0";
$stmt1 = $mysqli->prepare($query1);
if ($stmt1) {
    $stmt1->bind_param('s', $currentDate);
    if ($stmt1->execute()) {
        $archived1 = $stmt1->affected_rows;
        $totalArchived += $archived1;
        if ($archived1 > 0) {
            error_log("Archive Items CRON: Archived $archived1 items past delivery date");
        }
    } else {
        $errors[] = "Query 1 failed: " . $stmt1->error;
    }
    $stmt1->close();
} else {
    $errors[] = "Failed to prepare query 1: (" . $mysqli->errno . ") " . $mysqli->error;
}

// 2. Archive items where removed = 1 AND status NOT IN ('reserved', 'purchased') AND archive = 0
$query2 = "UPDATE items SET archive = 1 WHERE removed = 1 AND status NOT IN ('reserved', 'purchased') AND archive = 0";
$stmt2 = $mysqli->prepare($query2);
if ($stmt2) {
    if ($stmt2->execute()) {
        $archived2 = $stmt2->affected_rows;
        $totalArchived += $archived2;
        if ($archived2 > 0) {
            error_log("Archive Items CRON: Archived $archived2 removed items (not reserved/purchased)");
        }
    } else {
        $errors[] = "Query 2 failed: " . $stmt2->error;
    }
    $stmt2->close();
} else {
    $errors[] = "Failed to prepare query 2: (" . $mysqli->errno . ") " . $mysqli->error;
}

// 3. Archive items where removed = 1 AND status = 'purchased' AND date_received < current date AND archive = 0
$query3 = "UPDATE items SET archive = 1 WHERE removed = 1 AND status = 'purchased' AND date_received < ? AND date_received != '0000-00-00' AND archive = 0";
$stmt3 = $mysqli->prepare($query3);
if ($stmt3) {
    $stmt3->bind_param('s', $currentDate);
    if ($stmt3->execute()) {
        $archived3 = $stmt3->affected_rows;
        $totalArchived += $archived3;
        if ($archived3 > 0) {
            error_log("Archive Items CRON: Archived $archived3 removed purchased items past delivery date");
        }
    } else {
        $errors[] = "Query 3 failed: " . $stmt3->error;
    }
    $stmt3->close();
} else {
    $errors[] = "Failed to prepare query 3: (" . $mysqli->errno . ") " . $mysqli->error;
}

// Log summary (include app/version information for easier debugging)
if (count($errors) > 0) {
    error_log("Archive Items CRON [version=$APP_VERSION]: Errors occurred: " . implode('; ', $errors));
    exit(1);
} else {
    error_log("Archive Items CRON [version=$APP_VERSION]: Successfully completed. Total items archived: $totalArchived");
}

// Close the connection
$mysqli->close();

exit(0);
?>

