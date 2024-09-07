
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


function confirmUserIsValid($email, $mysqli) {
    $query = "SELECT * FROM `users` WHERE email = ? AND groupid = 1";
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
          $apiResponse = array("success" => $result->fetch_all(MYSQLI_ASSOC));
        } else {
            $apiResponse = array("error" => "No user found for $email");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}

function getItemListByUserId($userid, $mysqli) {
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

function updateRemovedStatusForMyItem($userid, $removed, $giftid, $mysqli) {
    $query = "UPDATE items SET removed = ? WHERE giftid = ? AND userid = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param('sis', $removed, $giftid, $userid);
    if ($stmt) {
        $stmt->execute();
        if ($stmt->affected_rows > 0) {
            $apiResponse = array("success" => "item $giftid updated");
        } else {
            $apiResponse = array("error" => "No items found for the specified user (affected rows: ".$stmt->affected_rows.").");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}


function updateAvatar($email_address, $avatar, $mysqli) {
    $query = "UPDATE users SET avatar = ? WHERE email = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param('ss', $avatar, $email_address);
    if ($stmt) {
        $stmt->execute();
        if ($stmt->affected_rows > 0) {
            $apiResponse = array("success" => "Avatar has been updated");
        } else {
            $apiResponse = array("error" => "No matching user found with email $email_address (affected rows: ".$stmt->affected_rows.").");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}


function addItemToMyOwnList($userid, $name, $description, $link, $groupid, $mysqli) {
    // Correct SQL query
    $addedByUserId = $userid;

    $stmt = $mysqli->prepare("INSERT INTO items (userid, name, description, link, added_by_userid, groupid) VALUES (?, ?, ?, ?, ?, ?)");

    if ($stmt) {
        // Bind the parameters correctly
        $stmt->bind_param('ssssss', $userid, $name, $description, $link, $addedByUserId, $groupid);
        
        // Execute the statement
        if ($stmt->execute()) {
            $apiResponse = array("success" => "Item added");
        } else {
            $apiResponse = array("error" => "Failed to add item: " . $stmt->error);
        }
        
        // Close the statement
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    
    return $apiResponse;
}

function updateItemInMyOwnList($userid, $itemid, $description, $link, $mysqli) {
    // Start building the SQL query dynamically
    $query = "UPDATE items SET ";
    $params = [];
    $types = '';

    if (!empty($description)) {
        $query .= "description = ?, ";
        $params[] = $description;
        $types .= 's';
    }

    if (!empty($link)) {
        $query .= "link = ?, ";
        $params[] = $link;
        $types .= 's';
    }

    // Check if there's anything to update
    if (empty($params)) {
        return array("error" => "No fields to update");
    }

    // Remove the last comma and space
    $query = rtrim($query, ', ');

    // Add the WHERE clause
    $query .= " WHERE userid = ? AND itemid = ?";
    $params[] = $userid;
    $params[] = $itemid;
    $types .= 'si';

    // Prepare the statement
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        // Bind the parameters dynamically
        $stmt->bind_param($types, ...$params);
        
        // Execute the statement
        if ($stmt->execute()) {
            // Check the number of affected rows
            if ($stmt->affected_rows > 0) {
                $apiResponse = array("success" => "Item updated");
            } else {
                $apiResponse = array("error" => "No rows updated. Please check the input.");
            }
        } else {
            $apiResponse = array("error" => "Failed to update item: " . $stmt->error);
        }

        // Close the statement
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    
    return $apiResponse;
}

?>