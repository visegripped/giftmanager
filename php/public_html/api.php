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
$access_token = $_POST['access_token'] ?? "";
$task = $_POST['task'] ?? "";
$myuserid = $_POST['myuserid'] ?? "";
$theiruserid = $_POST['theiruserid'] ?? "";
$userid = $_POST['userid'] ?? ""; // drop this in favor of my/their.
$itemid = $_POST['itemid'] ?? "";
$name = $_POST['name'] ?? "";
$avatar = $_POST['avatar'] ?? "";
$description = $_POST['description'] ?? "";
$link = $_POST['link'] ?? "";
$date_received = $_POST['date_received'] ?? "";
$removed = $_POST['removed'] ?? "";
$status = $_POST['status'] ?? "";
$qty = $_POST['qty'] ?? "1";
$archive = $_POST['archive'] ?? "1";
$added_by_userid = $_POST['added_by_userid'] ?? ""; // drop this in favor of my/their
$groupid = $_POST['groupid'] ?? "1";
$email_address = $_POST['email_address'] ?? "";

function isValidGoogleAccessToken($token) {
  if (!$token) {
    return false;
  }

  $url = "https://oauth2.googleapis.com/tokeninfo?access_token=" . $token;

  $response = file_get_contents($url);
  $result = json_decode($response, true);

  if (isset($result['aud']) && $result['aud'] === "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com") {
    return true;
  }
  return false;
}


// Types has the list of supported tasks

// disabled to make testing easier.
// if(!$access_token) {
//     $apiResponse = array("error" => "Access token not specified on API request.");
// } else if(!isValidGoogleAccessToken($access_token)) {
//     $apiResponse = array("error" => "Invalid/expired token.  Please sign (or re-sign) in.");
// }  else 

// my tasks
if($task == 'addItemToMyList' && $myuserid && $name && $groupid) {
    $apiResponse = addItemToMyList($myuserid, $name, $description, $link, $groupid, $mysqli);
} else if ($task == 'getMyItemList' && $myuserid) {
    $apiResponse = getMyItemList($myuserid, $mysqli);
}  else if($task == 'updateItemOnMyList' && $myuserid && $myuserid && $itemid && ($description || $link)) {
    $apiResponse = updateItemOnMyList($myuserid, $itemid, $description, $link, $mysqli);
} else if($task == 'updateRemovedStatusForMyItem' && $myuserid &&  $removed >= 0 &&  $itemid) {
    $apiResponse = updateRemovedStatusForMyItem($myuserid, $removed, $itemid, $mysqli);
} 
// their tasks
else if ($task == 'addItemToTheirList' && $theiruserid && $myuserid && $name) {
    $apiResponse = addItemToTheirList($myuserid, $theiruserid, $name, $description, $link, $groupid, $mysqli);
}
else if ($task == 'getTheirItemList' && $theiruserid) {
    $apiResponse = getTheirItemList($theiruserid, $mysqli);
}
else if ($task == 'updateStatusForTheirItem' && $theiruserid && $status && $myuserid && $itemid) {
    $apiResponse = updateStatusForTheirItem($myuserid, $theiruserid, $itemid, $status, $mysqli);
}
//generic
 else if ($task == 'getUserProfileByUserId' && $userid) {
    $apiResponse = getUserProfileByUserId($userid, $mysqli);
}
else if ($task == 'getUsersList') {
    $apiResponse = getUsers($mysqli);
} else if($task == 'updateAvatar' && $email_address && $avatar) {
    $apiResponse = updateAvatar($email_address, $avatar, $mysqli);
}  else if($task == 'confirmUserIsValid' && $email_address) {
    $apiResponse = confirmUserIsValid($email_address, $mysqli);
}
else {
    $apiResponse = array("error" => "Invalid task ($task) or myuserid ($myuserid) or missing params: thieruserid: $theiruserid, itemid: $itemid, removed: $removed, name: $name, description: $description, link: $link, groupid: $groupid, email: $email_address, avatar: $avatar");
}

// Close the connection
$mysqli->close();

// Return the response as JSON


echo json_encode($apiResponse);

?>
