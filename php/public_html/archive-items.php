<php header("Cache-Control: no-cache"); ?>
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

// Debug: Check for items that should match Query 1b
if (!$isCLI) {
    $debugQuery = "SELECT COUNT(*) as count FROM items WHERE archive = 0 AND date_received IS NOT NULL AND date_received != '' AND date_received != '0000-00-00' AND date_received < ?";
    $debugStmt = $mysqli->prepare($debugQuery);
    if ($debugStmt) {
        $debugStmt->bind_param('s', $currentDate);
        $debugStmt->execute();
        $debugResult = $debugStmt->get_result();
        $debugRow = $debugResult->fetch_assoc();
        echo "<div class='info'><strong>Debug:</strong> Found {$debugRow['count']} items that match Query 1b criteria (past delivery date, not archived)</div>";
        
        // Also check specifically for purchased items
        $debugQuery2 = "SELECT itemid, status, date_received, archive, removed FROM items WHERE archive = 0 AND status = 'purchased' AND date_received IS NOT NULL AND date_received != '' AND date_received != '0000-00-00' AND date_received < ? LIMIT 10";
        $debugStmt2 = $mysqli->prepare($debugQuery2);
        if ($debugStmt2) {
            $debugStmt2->bind_param('s', $currentDate);
            $debugStmt2->execute();
            $debugResult2 = $debugStmt2->get_result();
            $purchasedItems = [];
            while ($row = $debugResult2->fetch_assoc()) {
                $purchasedItems[] = $row;
            }
            if (count($purchasedItems) > 0) {
                echo "<div class='info'><strong>Debug - Purchased items past date:</strong> <pre>" . print_r($purchasedItems, true) . "</pre></div>";
            } else {
                echo "<div class='info'><strong>Debug:</strong> No purchased items found matching criteria</div>";
            }
            $debugStmt2->close();
        }
        $debugStmt->close();
    }
}

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
    echo "<h1>Archive Purchased Items - Execution Results</h1>";
    echo "<div class='info'><strong>Execution Date:</strong> " . date('Y-m-d H:i:s T') . "</div>";
    echo "<div class='info'><strong>Current Date (for comparison):</strong> $currentDate</div>";
    
        // Debug: Check for items that should match Query 1b
        $debugQuery = "SELECT COUNT(*) as count FROM items WHERE archive = 0 AND date_received IS NOT NULL AND date_received != '' AND TRIM(date_received) != '' AND date_received != '0000-00-00' AND CHAR_LENGTH(TRIM(date_received)) = 10 AND date_received REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' AND CAST(date_received AS CHAR(10)) < CAST(? AS CHAR(10))";
    $debugStmt = $mysqli->prepare($debugQuery);
    if ($debugStmt) {
        $debugStmt->bind_param('s', $currentDate);
        $debugStmt->execute();
        $debugResult = $debugStmt->get_result();
        $debugRow = $debugResult->fetch_assoc();
        echo "<div class='info'><strong>Debug:</strong> Found {$debugRow['count']} items that match Query 1b criteria (past delivery date, not archived)</div>";
        
        // Also check specifically for purchased items with dates
        $debugQuery2 = "SELECT itemid, status, date_received, archive, removed FROM items WHERE archive = 0 AND status = 'purchased' AND date_received IS NOT NULL AND date_received != '' AND TRIM(date_received) != '' AND date_received != '0000-00-00' AND CHAR_LENGTH(TRIM(date_received)) = 10 AND date_received REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' AND CAST(date_received AS CHAR(10)) < CAST(? AS CHAR(10)) LIMIT 10";
        $debugStmt2 = $mysqli->prepare($debugQuery2);
        if ($debugStmt2) {
            $debugStmt2->bind_param('s', $currentDate);
            $debugStmt2->execute();
            $debugResult2 = $debugStmt2->get_result();
            $purchasedItems = [];
            while ($row = $debugResult2->fetch_assoc()) {
                $purchasedItems[] = $row;
            }
            if (count($purchasedItems) > 0) {
                echo "<div class='info'><strong>Debug - Purchased items past date (should be archived):</strong> <pre>" . htmlspecialchars(print_r($purchasedItems, true)) . "</pre></div>";
            } else {
                echo "<div class='info'><strong>Debug:</strong> No purchased items found matching criteria (archive=0, status='purchased', date_received < $currentDate)</div>";
            }
            $debugStmt2->close();
        }
        
        // Check for any purchased items regardless of date
        $debugQuery3 = "SELECT itemid, status, date_received, archive, removed FROM items WHERE archive = 0 AND status = 'purchased' LIMIT 5";
        $debugResult3 = $mysqli->query($debugQuery3);
        if ($debugResult3) {
            $allPurchased = [];
            while ($row = $debugResult3->fetch_assoc()) {
                $allPurchased[] = $row;
            }
            if (count($allPurchased) > 0) {
                echo "<div class='info'><strong>Debug - Sample purchased items (archive=0):</strong> <pre>" . htmlspecialchars(print_r($allPurchased, true)) . "</pre></div>";
            }
        }
        $debugStmt->close();
    }
}

// 1. Archive items where date_received < current date AND archive = 0
// Also archive items with no date_received (NULL or empty) as they're considered already received
// Split into two queries: one for items with no date, one for items with valid dates
// First: Archive items with no date or invalid dates
// Use COALESCE to safely handle NULL/empty values
$query1a = "UPDATE items SET archive = 1 WHERE archive = 0 AND (date_received IS NULL OR TRIM(COALESCE(date_received, '')) = '' OR date_received = '0000-00-00')";
$stmt1a = $mysqli->prepare($query1a);
$archived1a = 0;
if ($stmt1a) {
    if ($stmt1a->execute()) {
        $archived1a = $stmt1a->affected_rows;
    }
    $stmt1a->close();
}

// Second: Archive items with valid dates that are past
// Note: This archives ALL items past delivery date, including purchased items
// Convert to CHAR first to avoid MySQL date type validation, then use CASE for safe comparison
$query1b = "UPDATE items SET archive = 1 WHERE archive = 0 AND 
    CASE 
        WHEN date_received IS NULL THEN 0
        WHEN CAST(date_received AS CHAR) = '' THEN 0
        WHEN CAST(date_received AS CHAR) = '0000-00-00' THEN 0
        WHEN CHAR_LENGTH(TRIM(CAST(date_received AS CHAR))) != 10 THEN 0
        WHEN CAST(date_received AS CHAR) NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN 0
        WHEN CAST(date_received AS CHAR(10)) < CAST(? AS CHAR(10)) THEN 1
        ELSE 0
    END = 1";
$stmt1 = $mysqli->prepare($query1b);
if ($stmt1) {
    $stmt1->bind_param('s', $currentDate);
    if ($stmt1->execute()) {
        $archived1b = $stmt1->affected_rows;
        $archived1 = $archived1a + $archived1b;
        $totalArchived += $archived1;
        $results['past_delivery_date']['count'] = $archived1;
        if ($archived1 > 0) {
            $logMsg = "Archive Items: Archived $archived1 items (including $archived1a with no date and $archived1b past delivery date)";
            error_log($logMsg);
            if (!$isCLI) {
                echo "<div class='info'>✓ $logMsg</div>";
            }
        } else {
            if (!$isCLI) {
                echo "<div class='info'>No items found past delivery date or with no date to archive.</div>";
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
// Also archive items with no date_received (NULL or empty) as they're considered already received
// Split into two queries: one for items with no date, one for items with valid dates
// First: Archive removed purchased items with no date or invalid dates
// Use COALESCE to safely handle NULL/empty values
$query3a = "UPDATE items SET archive = 1 WHERE removed = 1 AND status = 'purchased' AND archive = 0 AND (date_received IS NULL OR TRIM(COALESCE(date_received, '')) = '' OR date_received = '0000-00-00')";
$stmt3a = $mysqli->prepare($query3a);
$archived3a = 0;
if ($stmt3a) {
    if ($stmt3a->execute()) {
        $archived3a = $stmt3a->affected_rows;
    }
    $stmt3a->close();
}

// Second: Archive removed purchased items with valid dates that are past
// Convert to CHAR first to avoid MySQL date type validation, then use CASE for safe comparison
$query3b = "UPDATE items SET archive = 1 WHERE removed = 1 AND status = 'purchased' AND archive = 0 AND 
    CASE 
        WHEN date_received IS NULL THEN 0
        WHEN CAST(date_received AS CHAR) = '' THEN 0
        WHEN CAST(date_received AS CHAR) = '0000-00-00' THEN 0
        WHEN CHAR_LENGTH(TRIM(CAST(date_received AS CHAR))) != 10 THEN 0
        WHEN CAST(date_received AS CHAR) NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN 0
        WHEN CAST(date_received AS CHAR(10)) < CAST(? AS CHAR(10)) THEN 1
        ELSE 0
    END = 1";
$stmt3 = $mysqli->prepare($query3b);
if ($stmt3) {
    $stmt3->bind_param('s', $currentDate);
    if ($stmt3->execute()) {
        $archived3b = $stmt3->affected_rows;
        $archived3 = $archived3a + $archived3b;
        $totalArchived += $archived3;
        $results['removed_purchased_past_date']['count'] = $archived3;
        if ($archived3 > 0) {
            $logMsg = "Archive Items: Archived $archived3 removed purchased items (including $archived3a with no date and $archived3b past delivery date)";
            error_log($logMsg);
            if (!$isCLI) {
                echo "<div class='info'>✓ $logMsg</div>";
            }
        } else {
            if (!$isCLI) {
                echo "<div class='info'>No removed purchased items past delivery date or with no date found to archive.</div>";
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

