<?
include "../includes/report-credentials.php";

// https://www.siteground.com/tutorials/php-mysql/connect-database/


// Something is wrong w/ this script.  I've duplicated what works from test.php in report.php
// Need to come back to this but I'm over it for now.



$task = $_POST['task'] ?? "";

// Assuming $mysqli is your mysqli connection object
$mysqli = new mysqli("localhost", $dbusername, $dbpassword, $dbname);

// Check connection
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
    exit();
}

function addReport($mysqli) {
  print("\Start addReport");
  $stmt->bind_param("sss", $report, $type, $body);
  print("/nGot past stmt");

  $query = "INSERT INTO reports (report, type, body) VALUES (?, ?, ?)";
    
  $stmt = $mysqli->prepare($query);
  
  $report = $_POST['report'] ?? "";
  $type = $_POST['type'] ?? "";
  $body = $_POST['body'] ?? "";

  print("/nGot past vars");

  if($stmt) {
    print("Start stmt");
    $executed = $stmt->execute();
    if ($executed) {
      print("Start executed");
      $response = "success";
    }
    else {
      print("\Failed execution");
      $response =  '{"Error":"Failed to prepare the statement: (' . $mysqli->errno . ') ' . $mysqli->error .'."}';
    }
  }
  else {
    print("\SFailed stmt");
    $response = '{"error": "Failed to insert data: (' . $stmt->errno . ') ' . $stmt->error . '."}';
  }
  $stmt->close();
  return $response;
}

$apiResponse = addReport($mysqli);

// Close the connection
$mysqli->close();


header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: X-Requested-With");
// disable caching
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

return print("success?");
?>