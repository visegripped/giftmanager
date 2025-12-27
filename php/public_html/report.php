<?php
// Suppress error output to prevent breaking JSON responses
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// CORS headers - must be set before any output
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization");
header("Access-Control-Max-Age: 86400");
header('Content-type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Versioned includes
require_once __DIR__ . '/../includes/current_version.php';
include gm_get_include_path('report-credentials.php');

$task = $_POST['task'] ?? "";

// Assuming $mysqli is your mysqli connection object
// Support Docker environment (use DB_HOST from env, fallback to localhost)
$dbHost = gmGetEnv('DB_HOST') ?: 'localhost';
$mysqli = new mysqli($dbHost, $username, $password, $database);

// Check connection
if ($mysqli->connect_errno) {
     $apiResponse = array("error" => "Failed to connect to MySQL: ($mysqli->connect_errno  $mysqli->connect_error");
    exit();
}

// Prepare the SQL statement
$query = "INSERT INTO reports (report, type, body) VALUES (?, ?, ?)";
$stmt = $mysqli->prepare($query);

if ($stmt) {
    // Bind the parameters (s means string type)
    $stmt->bind_param("sss", $report, $type, $body);

    // Set the parameters and execute
    $report = $_POST['report'] ?? "";
    $type = $_POST['type'] ?? "";
    $body = $_POST['body'] ?? "";

    // Execute the statement
    $executed = $stmt->execute();

    // Check if the execution was successful
    if ($executed) {
        $apiResponse = array("success" => "Data successfully inserted.");
    } else {
        $apiResponse = array("error" => "Failed to insert data: $stmt->errno $stmt->error");
    }

    // Close the statement
    $stmt->close();
} else {
    $apiResponse = array("error" => "Failed to prepare the statement: ($mysqli->errno  $mysqli->error");
    }

$apiResponse = json_encode($apiResponse);

// Close the connection
$mysqli->close();


print($apiResponse);

?>