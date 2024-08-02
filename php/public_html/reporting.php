<?
include "../includes/report-credentials.php";

$task = $_POST['task'] ?? "";

// Assuming $mysqli is your mysqli connection object
$mysqli = new mysqli("localhost", $dbusername, $dbpassword, $dbname);

// Check connection
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
    exit();
}

function addReport($db) {
  $stmt->bind_param("sss", $report, $type, $body);
  $query = "INSERT INTO reports (report, type, body) VALUES (?, ?, ?)";
  
  $stmt = $mysqli->prepare($query);
  
  $report = $_POST['report'] ?? "";
  $type = $_POST['type'] ?? "";
  $body = $_POST['body'] ?? "";

  $executed = $stmt->execute();

  if ($executed) {
//    echo "Data successfully inserted.";
    $response = '{"success":"Succesfully submited report."}';
    } else {
//    echo "Failed to insert data: (" . $stmt->errno . ") " . $stmt->error;   
    $response = '{"error": "Failed to insert data: (' . $stmt->errno . ') ' . $stmt->error . '."}';
  }
  $stmt->close();
  return $response;
}




if ($stmt) {
  if($task === 'addReport') {
    $apiResponse = addReport($stmt);
  }
} else {
  $apiResponse =  '{"Error":"Failed to prepare the statement: (' . $mysqli->errno . ') ' . $mysqli->error .'."}';
  exit();
}

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


?>