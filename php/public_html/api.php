<?php

include "../includes/api-credentials.php";
include "../includes/api-functions.php";

// Assuming $mysqli is your mysqli connection object
$mysqli = new mysqli("localhost", $username, $password, $database);
$apiResponse = array("warn" => "successful post with no task passed.");

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



// valid tasks:
// getMyList
// getListByUserId
// getUserList
// getUserProfile
// addItemToListByUserId
// updateItem
// deleteItem


if ($task == 'getMyList' && $userid) {
    $apiResponse = getMyList($userid, $mysqli);
} else if ($task == 'getListByUserId' && $userid) {
    $apiResponse = getListByUserId($userid, $mysqli);
} else if ($task == 'getUserList') {
    $apiResponse = getUserList($mysqli);
}
else {
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
