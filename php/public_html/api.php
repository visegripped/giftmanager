<?php
// Start output buffering to catch any premature output
ob_start();

// Suppress error output to prevent breaking JSON responses
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Global error handler to ensure we always return JSON
function globalErrorHandler($errno, $errstr, $errfile, $errline) {
    // Log the error
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    
    // Only output JSON if headers haven't been sent
    if (!headers_sent()) {
        http_response_code(500);
        header("Access-Control-Allow-Origin: *");
        header('Content-type: application/json');
        echo json_encode(array("error" => "Internal server error: $errstr"));
        exit();
    }
}

// Set up error handlers
set_error_handler('globalErrorHandler', E_ALL);
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        // Fatal error occurred
        if (!headers_sent()) {
            http_response_code(500);
            header("Access-Control-Allow-Origin: *");
            header('Content-type: application/json');
            echo json_encode(array("error" => "Fatal error: " . $error['message']));
        }
    }
});

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
try {
    require_once __DIR__ . '/../includes/current_version.php';
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(array("error" => "Failed to load version configuration: " . $e->getMessage()));
    exit();
}

// Credentials always come from root includes folder (never versioned)
try {
    // Check if the function exists (should be in current_version.php)
    if (!function_exists('gm_get_credentials_path')) {
        throw new Exception("Function gm_get_credentials_path() not found. Check includes/current_version.php");
    }
    
    $credentialsPath = gm_get_credentials_path('api-credentials.php');
    if (!file_exists($credentialsPath)) {
        throw new Exception("Credentials file not found: $credentialsPath");
    }
    include $credentialsPath;
} catch (Throwable $e) {
    ob_clean();
    http_response_code(500);
    header("Access-Control-Allow-Origin: *");
    header('Content-type: application/json');
    echo json_encode(array("error" => "Failed to load credentials: " . $e->getMessage()));
    ob_end_flush();
    exit();
}

// Versioned code files come from versioned releases
try {
    $functionsPath = gm_get_include_path('api-functions.php');
    if (!file_exists($functionsPath)) {
        throw new Exception("API functions file not found: $functionsPath");
    }
    include $functionsPath;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(array("error" => "Failed to load API functions: " . $e->getMessage()));
    exit();
}

// Assuming $mysqli is your mysqli connection object
// Support Docker environment (use DB_HOST from env, fallback to localhost)
$dbHost = gmGetEnv('DB_HOST') ?: 'localhost';
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
$auth_provider = $_POST['auth_provider'] ?? ""; // 'google' or 'facebook'
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
  $googleClientId = gmGetEnv('GOOGLE_OAUTH_CLIENT_ID') ?: "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";

  $url = "https://oauth2.googleapis.com/tokeninfo?access_token=" . $token;

  $response = file_get_contents($url);
  $result = json_decode($response, true);

  if (isset($result['aud']) && $result['aud'] === $googleClientId) {
    return true;
  }
  return false;
}

function isValidFacebookAccessToken($token) {
  if (!$token) {
    return false;
  }

  // Get Facebook App ID and Secret from environment variables
  $fbAppId = gmGetEnv('FB_APP_ID') ?: "";
  $fbAppSecret = gmGetEnv('FB_APP_SECRET') ?: "";

  // Generate appsecret_proof if app secret is available
  $appsecret_proof = '';
  if ($fbAppSecret) {
    $appsecret_proof = hash_hmac('sha256', $token, $fbAppSecret);
  }

  // Validate token by checking user info
  $params = array('access_token' => $token, 'fields' => 'id');
  if ($appsecret_proof) {
    $params['appsecret_proof'] = $appsecret_proof;
  }
  $url = "https://graph.facebook.com/me?" . http_build_query($params);

  $response = @file_get_contents($url);
  if ($response === false) {
    return false;
  }

  $result = json_decode($response, true);

  // If there's an error, token is invalid
  if (isset($result['error'])) {
    return false;
  }

  // If we get user data, token is valid
  if (isset($result['id'])) {
    return true;
  }

  return false;
}

function isValidAccessToken($token, $provider) {
  if (!$token || !$provider) {
    return false;
  }

  if ($provider === 'google') {
    return isValidGoogleAccessToken($token);
  } else if ($provider === 'facebook') {
    return isValidFacebookAccessToken($token);
  }

  return false;
}


// Types has the list of supported tasks

// Handle getFacebookProfile task first (skip token validation for this task)
if($task == 'getFacebookProfile') {
    if (!$access_token) {
        $apiResponse = array("error" => "Access token not specified for getFacebookProfile task.");
    } else if (function_exists('getFacebookProfile')) {
        // Fetch Facebook profile via server-side proxy (adds appsecret_proof)
        $apiResponse = getFacebookProfile($access_token);
    } else {
        $apiResponse = array("error" => "getFacebookProfile function not found. Please check api-functions.php includes.");
    }
} else {
    // Default to 'google' for backward compatibility if provider not specified
    $provider = $auth_provider ?: 'google';
    if(!isValidAccessToken($access_token, $provider)) {
        $apiResponse = array("error" => "Invalid/expired token.  Please sign (or re-sign) in.");
    }
}

// If token validation failed, exit early with error response
if (isset($apiResponse["error"]) && $task != 'getFacebookProfile') {
    echo json_encode($apiResponse);
    exit();
}

// my tasks - only process if task is not getFacebookProfile and no error has been set
if($task != 'getFacebookProfile' && (!isset($apiResponse) || !isset($apiResponse["error"]))) {
    if($task == 'addItemToMyList' && $myuserid && $name && $groupid) {
        $apiResponse = addItemToMyList($myuserid, $name, $description, $link, $groupid, $mysqli);
    } else if ($task == 'getMyItemList' && $myuserid) {
        $apiResponse = getMyItemList($myuserid, $mysqli);
    } else if ($task == 'getMyReservedPurchasedItems' && $myuserid) {
        $apiResponse = getMyReservedPurchasedItems($myuserid, $mysqli);
    } else if($task == 'updateItemOnMyList' && $myuserid && $myuserid && $itemid && ($description || $link)) {
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
        $apiResponse = updateStatusForTheirItem($myuserid, $theiruserid, $itemid, $status, $mysqli, $date_received);
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
    else if(!isset($apiResponse)) {
        $apiResponse = array("error" => "Invalid task ($task) or myuserid ($myuserid) or missing params: thieruserid: $theiruserid, itemid: $itemid, removed: $removed, name: $name, description: $description, link: $link, groupid: $groupid, email: $email_address, avatar: $avatar");
    }
}

// Close the connection
$mysqli->close();

// Return the response as JSON
// Clear any output that might have been generated
ob_clean();

// Ensure we always have a valid response array
if (!isset($apiResponse) || !is_array($apiResponse)) {
    $apiResponse = array("error" => "Invalid API response format");
}

// Ensure headers are set correctly
if (!headers_sent()) {
    header("Access-Control-Allow-Origin: *");
    header('Content-type: application/json');
} else {
    // If headers were already sent, log the error
    error_log("API Error: Headers already sent before JSON output");
}

echo json_encode($apiResponse);
ob_end_flush();
exit();
?>
