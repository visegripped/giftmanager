<?php
header('Content-type: application/json');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header("Access-Control-Allow-Origin: '*'");
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
$myuserid = $_POST['myuserid'] ?? "";
$userid = $_POST['userid'] ?? "";
$giftid = $_POST['giftid'] ?? "";
$name = $_POST['name'] ?? "";
$note = $_POST['note'] ?? "";
$link = $_POST['link'] ?? "";
$date_received = $_POST['date_received'] ?? "";
$removed = $_POST['removed'] ?? "";
$status = $_POST['status'] ?? "";
$qty = $_POST['qty'] ?? "1";
$archive = $_POST['archive'] ?? "1";
$added_by_userid = $_POST['added_by_userid'] ?? "";
$groupid = $_POST['groupid'] ?? "1";



// valid tasks:
// getMyList
// getListByUserId
// getUserList
// getUserProfile
// addItemToMyOwnList
// addItemToListByUserId
// updateRemovedStatusForMyItem
// updateMyItem
// deleteItem


if ($task == 'getMyList' && $myuserid) {
    $apiResponse = getMyList($myuserid, $mysqli);
} else if ($task == 'getListByUserId' && $userid) {
    $apiResponse = getListByUserId($userid, $mysqli);
} else if ($task == 'getUsers') {
    $apiResponse = getUsers($mysqli);
} else if($task == 'updateRemovedStatusForMyItem' && $userid &&  $removed >= 0 &&  $giftid && ($myuserid == $userid)) {
    $apiResponse = updateRemovedStatusForMyItem($userid, $removed, $giftid, $mysqli);
}  else if($task == 'addItemToMyOwnList' && $userid && ($added_by_userid == $userid) && $name && $groupid) {
    $apiResponse = addItemToMyOwnList($userid, $name, $description, $link, $groupid, $mysqli);
} else if($task == 'updateItemOnMyOwnList' && $userid && ($myuserid == $userid) && $giftid && ($description || $link)) {
    $apiResponse = updateItemOnMyOwnList($userid, $itemid, $description, $link, $mysqli);
}
else {
    $apiResponse = array("error" => "Invalid task ($task) or userid ($userid) or missing params: myuserid: $myuserid, giftid: $giftid, removed: $removed, name: $name, description: $description, link: $link, groupid: $groupid");
}

// Close the connection
$mysqli->close();

// Return the response as JSON


echo json_encode($apiResponse);

?>
