
<?php


function getMyList($userid, $mysqli) {
    $query = "SELECT * FROM `items` WHERE userid = ? AND added_by_userid = ? AND `archive` = 0 ORDER BY date_added ASC";
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        $stmt->bind_param("ss", $userid, $userid);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
          $apiResponse = array("success" => $result->fetch_all(MYSQLI_ASSOC));
        } else {
            $apiResponse = array("warn" => "No items found for the specified user.");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}


function getListByUserId($userid, $mysqli) {
    $query = "SELECT * FROM `items` WHERE userid = ? ORDER BY date_added ASC";
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        $stmt->bind_param("ss", $userid);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $apiResponse = array("success" => $result->fetch_all(MYSQLI_ASSOC));
        } else {
            $apiResponse = array("warn" => "No items found for the specified user.");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}


function getUsers($mysqli) {
    $query = "SELECT * FROM `users` ORDER BY firstname ASC";
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        // $stmt->bind_param("ss", $userid);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $apiResponse = array("success" => $result->fetch_all(MYSQLI_ASSOC));
        } else {
            $apiResponse = array("warn" => "No items found for the specified user.");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}


?>