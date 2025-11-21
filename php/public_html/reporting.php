<?php
/**
 * GraphQL Reporting API Endpoint
 */

// Suppress error output to prevent breaking JSON responses
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Origin: *");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load dependencies
// Vendor path: from public_html/ -> parent (html, which is /var/www/html in container) -> vendor/
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../includes/reporting-credentials.php';
require_once __DIR__ . '/../includes/reporting-functions.php';
require_once __DIR__ . '/../includes/graphql-schema.php';
require_once __DIR__ . '/../includes/graphql-resolvers.php';

use GraphQL\GraphQL;
use GraphQL\Type\Schema;
use GraphQL\Error\FormattedError;

// Connect to reports database
$dbHost = getenv('DB_HOST') ?: 'localhost';
$mysqli = new mysqli($dbHost, $username, $password, $database);

// Check connection
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(array(
        "errors" => array(
            array(
                "message" => "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error
            )
        )
    ));
    exit();
}

try {
    // Get the schema
    global $schema;
    if (!isset($schema)) {
        throw new Exception("GraphQL schema not initialized");
    }
    
    // Get resolvers
    $resolvers = getGraphQLResolvers();
    
    // Get request data
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    // Handle GET requests with query parameter
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['query'])) {
        $input = array(
            'query' => $_GET['query'],
            'variables' => isset($_GET['variables']) ? json_decode($_GET['variables'], true) : null
        );
    }
    
    // Get query and variables
    $query = isset($input['query']) ? $input['query'] : '';
    $variables = isset($input['variables']) ? $input['variables'] : null;
    $operationName = isset($input['operationName']) ? $input['operationName'] : null;
    
    if (empty($query)) {
        throw new Exception("Query is required");
    }
    
    // Create context for resolvers
    $context = array(
        'mysqli' => $mysqli,
        'resolvers' => $resolvers
    );
    
    // Execute GraphQL query
    $result = GraphQL::executeQuery(
        $schema,
        $query,
        null,
        $context,
        $variables,
        $operationName
    );
    
    // Format output
    $output = $result->toArray();
    
    // Set HTTP status code based on errors
    if (isset($output['errors']) && !empty($output['errors'])) {
        http_response_code(400);
    } else {
        http_response_code(200);
    }
    
    echo json_encode($output);
    
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "errors" => array(
            array(
                "message" => $e->getMessage()
            )
        )
    ));
} finally {
    // Close the connection
    if (isset($mysqli)) {
        $mysqli->close();
    }
}

?>

