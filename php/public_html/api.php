<?php

include "../includes/api-credentials.php";

// Assuming $mysqli is your mysqli connection object
$mysqli = new mysqli("localhost", $username, $password, $database);
$apiResponse = array("warn" => "successful post with no task assignment.");

// Check connection
if ($mysqli->connect_errno) {
    $apiResponse = array("error" => "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
    exit(json_encode($apiResponse));
}

// Get POST variables
$task = $_POST['task'] ?? "";
$userid = $_POST['userid'] ?? "";
$name = $_POST['name'] ?? "";
$note = $_POST['note'] ?? "";
$link = $_POST['link'] ?? "";
$date_received = $_POST['date_received'] ?? "";
$removed = $_POST['removed'] ?? "";
$status = $_POST['status'] ?? "";
$qty = $_POST['qty'] ?? "1";
$added_by_userid = $_POST['added_by_userid'] ?? "";
$groupid = $_POST['groupid'] ?? "1";

if ($task == 'getMyList' && $userid !== "") {
    $query = "SELECT * FROM `items` WHERE userid = ? AND added_by_userid = ? AND `removed` = 0 ORDER BY date_added ASC";
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        $stmt->bind_param("ss", $userid, $userid);
        $stmt->execute();
        
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $apiResponse = $result->fetch_all(MYSQLI_ASSOC);
        } else {
            $apiResponse = array("error" => "No items found for the specified user.");
        }

        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
} else {
    $apiResponse = array("error" => "Invalid task or userid.");
}

// Close the connection
$mysqli->close();

// Return the response as JSON
header('Content-type: application/json');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");

echo json_encode($apiResponse);

?>
