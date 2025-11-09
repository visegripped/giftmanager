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

include "../includes/api-credentials.php";
include "../includes/api-functions.php";

// Assuming $mysqli is your mysqli connection object
// Support Docker environment (use DB_HOST from env, fallback to localhost)
$dbHost = getenv('DB_HOST') ?: 'localhost';
$mysqli = new mysqli($dbHost, $username, $password, $database);
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

  // Get Google OAuth client ID from environment variable
  // Fallback to hardcoded value for backward compatibility (should be removed in production)
  $googleClientId = getenv('GOOGLE_OAUTH_CLIENT_ID') ?: "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";

  $url = "https://oauth2.googleapis.com/tokeninfo?access_token=" . $token;

  $response = file_get_contents($url);
  $result = json_decode($response, true);

  if (isset($result['aud']) && $result['aud'] === $googleClientId) {
    return true;
  }
  return false;
}


// Types has the list of supported tasks

if(!$access_token) {
    $apiResponse = array("error" => "Access token not specified on API request.");
} else if(!isValidGoogleAccessToken($access_token)) {
    $apiResponse = array("error" => "Invalid/expired token.  Please sign (or re-sign) in.");
}   

// my tasks
 else if($task == 'addItemToMyList' && $myuserid && $name && $groupid) {
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
//general
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

// admin
else if($task == 'archivePurchasedItems' && $myuserid == 1) {
    $apiResponse = archivePurchasedItems($myuserid, $mysqli);
    }
else if($task == 'archiveRemovedItems' && $myuserid == 1) {
    $apiResponse = archiveRemovedItems($myuserid, $mysqli);
    }
else {
    $apiResponse = array("error" => "Invalid task ($task) or myuserid ($myuserid) or missing params: thieruserid: $theiruserid, itemid: $itemid, removed: $removed, name: $name, description: $description, link: $link, groupid: $groupid, email: $email_address, avatar: $avatar");
}

// Close the connection
$mysqli->close();

// Return the response as JSON


echo json_encode($apiResponse);

?>
