<?php
/**
 * CRON script to archive items based on delivery dates and removal status
 * 
 * This script should be run daily via CRON:
 * 0 0 * * * /usr/bin/php /path/to/archive-items.php
 * 
 * Can also be accessed via web browser for manual execution and viewing results.
 * 
 * Logic:
 * 1. Archive items where date_received < current date AND archive = 0
 * 2. Archive items where removed = 1 AND status NOT IN ('reserved', 'purchased') AND archive = 0
 * 3. Archive items where removed = 1 AND status = 'purchased' AND date_received < current date AND archive = 0
 */

// Detect if running from CLI (CRON) or web browser
$isCLI = php_sapi_name() === 'cli';

// Suppress error output for CRON execution, but show for web
error_reporting(E_ALL);
if ($isCLI) {
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
} else {
    ini_set('display_errors', '1');
    ini_set('log_errors', '1');
    // Set headers for web output
    header('Content-Type: text/html; charset=utf-8');
}

// Set timezone
date_default_timezone_set('UTC');

// Include database credentials (always from root includes folder, never versioned)
require_once __DIR__ . '/../includes/current_version.php';

// Load environment helper functions (needed for gmGetEnv())
require_once __DIR__ . '/../includes/env-loader.php';
if (function_exists('gmLoadEnv')) {
    gmLoadEnv();
}

include gm_get_credentials_path('api-credentials.php');

// Support Docker environment (use DB_HOST from env, fallback to localhost)
$dbHost = gmGetEnv('DB_HOST') ?: 'localhost';
$mysqli = new mysqli($dbHost, $username, $password, $database);

// Check connection
if ($mysqli->connect_errno) {
    $errorMsg = "Archive Items: Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
    error_log($errorMsg);
    if (!$isCLI) {
        echo "<!DOCTYPE html><html><head><title>Archive Items - Error</title></head><body>";
        echo "<h1>Archive Items - Error</h1>";
        echo "<p style='color: red;'>$errorMsg</p>";
        echo "</body></html>";
    }
    exit(1);
}

$currentDate = date('Y-m-d');
$totalArchived = 0;
$errors = [];
$results = [
    'past_delivery_date' => ['count' => 0, 'description' => 'Items past delivery date'],
    'removed_not_reserved_purchased' => ['count' => 0, 'description' => 'Removed items (not reserved/purchased)'],
    'removed_purchased_past_date' => ['count' => 0, 'description' => 'Removed purchased items past delivery date'],
];

// Output header for web access
if (!$isCLI) {
    echo "<!DOCTYPE html>\n";
    echo "<html><head><title>Archive Items - Results</title>";
    echo "<style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .success { color: green; }
        .error { color: red; }
        .info { color: #666; margin: 10px 0; }
        table { border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style></head><body>";
    echo "<h1>Archive Items - Execution Results</h1>";
    echo "<div class='info'><strong>Execution Date:</strong> " . date('Y-m-d H:i:s T') . "</div>";
    echo "<div class='info'><strong>Current Date (for comparison):</strong> $currentDate</div>";
}

// 1. Archive items where date_received < current date AND archive = 0
// Use CAST to safely handle date comparison - invalid dates (like '0000-00-00') become NULL
$query1 = "UPDATE items SET archive = 1 WHERE archive = 0 AND date_received IS NOT NULL AND date_received != '' AND CAST(date_received AS DATE) IS NOT NULL AND CAST(date_received AS DATE) < CAST(? AS DATE)";
$stmt1 = $mysqli->prepare($query1);
if ($stmt1) {
    $stmt1->bind_param('s', $currentDate);
    if ($stmt1->execute()) {
        $archived1 = $stmt1->affected_rows;
        $totalArchived += $archived1;
        $results['past_delivery_date']['count'] = $archived1;
        if ($archived1 > 0) {
            $logMsg = "Archive Items: Archived $archived1 items past delivery date";
            error_log($logMsg);
            if (!$isCLI) {
                echo "<div class='info'>✓ $logMsg</div>";
            }
        } else {
            if (!$isCLI) {
                echo "<div class='info'>No items found past delivery date to archive.</div>";
            }
        }
    } else {
        $errorMsg = "Query 1 failed: " . $stmt1->error;
        $errors[] = $errorMsg;
        if (!$isCLI) {
            echo "<div class='error'>✗ $errorMsg</div>";
        }
    }
    $stmt1->close();
} else {
    $errorMsg = "Failed to prepare query 1: (" . $mysqli->errno . ") " . $mysqli->error;
    $errors[] = $errorMsg;
    if (!$isCLI) {
        echo "<div class='error'>✗ $errorMsg</div>";
    }
}

// 2. Archive items where removed = 1 AND status NOT IN ('reserved', 'purchased') AND archive = 0
$query2 = "UPDATE items SET archive = 1 WHERE removed = 1 AND status NOT IN ('reserved', 'purchased') AND archive = 0";
$stmt2 = $mysqli->prepare($query2);
if ($stmt2) {
    if ($stmt2->execute()) {
        $archived2 = $stmt2->affected_rows;
        $totalArchived += $archived2;
        $results['removed_not_reserved_purchased']['count'] = $archived2;
        if ($archived2 > 0) {
            $logMsg = "Archive Items: Archived $archived2 removed items (not reserved/purchased)";
            error_log($logMsg);
            if (!$isCLI) {
                echo "<div class='info'>✓ $logMsg</div>";
            }
        } else {
            if (!$isCLI) {
                echo "<div class='info'>No removed items (not reserved/purchased) found to archive.</div>";
            }
        }
    } else {
        $errorMsg = "Query 2 failed: " . $stmt2->error;
        $errors[] = $errorMsg;
        if (!$isCLI) {
            echo "<div class='error'>✗ $errorMsg</div>";
        }
    }
    $stmt2->close();
} else {
    $errorMsg = "Failed to prepare query 2: (" . $mysqli->errno . ") " . $mysqli->error;
    $errors[] = $errorMsg;
    if (!$isCLI) {
        echo "<div class='error'>✗ $errorMsg</div>";
    }
}

// 3. Archive items where removed = 1 AND status = 'purchased' AND date_received < current date AND archive = 0
// Use CAST to safely handle date comparison - invalid dates (like '0000-00-00') become NULL
$query3 = "UPDATE items SET archive = 1 WHERE removed = 1 AND status = 'purchased' AND archive = 0 AND date_received IS NOT NULL AND date_received != '' AND CAST(date_received AS DATE) IS NOT NULL AND CAST(date_received AS DATE) < CAST(? AS DATE)";
$stmt3 = $mysqli->prepare($query3);
if ($stmt3) {
    $stmt3->bind_param('s', $currentDate);
    if ($stmt3->execute()) {
        $archived3 = $stmt3->affected_rows;
        $totalArchived += $archived3;
        $results['removed_purchased_past_date']['count'] = $archived3;
        if ($archived3 > 0) {
            $logMsg = "Archive Items: Archived $archived3 removed purchased items past delivery date";
            error_log($logMsg);
            if (!$isCLI) {
                echo "<div class='info'>✓ $logMsg</div>";
            }
        } else {
            if (!$isCLI) {
                echo "<div class='info'>No removed purchased items past delivery date found to archive.</div>";
            }
        }
    } else {
        $errorMsg = "Query 3 failed: " . $stmt3->error;
        $errors[] = $errorMsg;
        if (!$isCLI) {
            echo "<div class='error'>✗ $errorMsg</div>";
        }
    }
    $stmt3->close();
} else {
    $errorMsg = "Failed to prepare query 3: (" . $mysqli->errno . ") " . $mysqli->error;
    $errors[] = $errorMsg;
    if (!$isCLI) {
        echo "<div class='error'>✗ $errorMsg</div>";
    }
}

// Output summary for web access
if (!$isCLI) {
    echo "<div class='summary'>";
    echo "<h2>Summary</h2>";
    echo "<table>";
    echo "<tr><th>Category</th><th>Items Archived</th></tr>";
    foreach ($results as $key => $result) {
        echo "<tr><td>{$result['description']}</td><td>{$result['count']}</td></tr>";
    }
    echo "<tr><th>Total</th><th>$totalArchived</th></tr>";
    echo "</table>";
    echo "</div>";

    if (count($errors) > 0) {
        echo "<div class='error'>";
        echo "<h2>Errors</h2><ul>";
        foreach ($errors as $error) {
            echo "<li>$error</li>";
        }
        echo "</ul></div>";
    } else {
        echo "<div class='success'><h2>✓ Execution completed successfully</h2></div>";
    }

    if (isset($APP_VERSION)) {
        echo "<div class='info'><strong>Version:</strong> $APP_VERSION</div>";
    }
    echo "</body></html>";
}

// Log summary (include app/version information for easier debugging)
if (count($errors) > 0) {
    $logMsg = "Archive Items [version=$APP_VERSION]: Errors occurred: " . implode('; ', $errors);
    error_log($logMsg);
    exit(1);
} else {
    $logMsg = "Archive Items [version=$APP_VERSION]: Successfully completed. Total items archived: $totalArchived";
    error_log($logMsg);
}

// Close the connection
$mysqli->close();

exit(0);
?>

