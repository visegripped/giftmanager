<?

include "../includes/report-credentials.php";

$task = $_POST['task'] ?? "";

// Assuming $mysqli is your mysqli connection object
$mysqli = new mysqli("localhost", $username, $password, $database);

// Check connection
if ($mysqli->connect_errno) {
    $apiResponse =  '{"error" : "Failed to connect to MySQL: ("' . $mysqli->connect_errno . '") "' . $mysqli->connect_error .'"}';
    exit();
}

// Prepare the SQL statement
$query = "INSERT INTO reports (report, type, body) VALUES (?, ?, ?)";
$stmt = $mysqli->prepare($query);
$query = '{"warn" : "successful post with no task assignment."}';

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
        $apiResponse =  '{"success":"Data successfully inserted."}';
    } else {
        $apiResponse =  '{"error":"Failed to insert data: ("' . $stmt->errno .' ") "' . $stmt->error .'"}';
    }

    // Close the statement
    $stmt->close();
} else {
    $apiResponse =  '{"error" : "Failed to prepare the statement: ("' . $mysqli->errno . '") "' . $mysqli->error . '" }';
}

$apiResponse = json_encode($apiResponse);

// Close the connection
$mysqli->close();


header('Content-type: application/json');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");


print($apiResponse);

?>