
<?php
// my
function addItemToMyList($userid, $name, $description, $link, $groupid, $mysqli) {
    // Correct SQL query
    $addedByUserId = $userid;

    $stmt = $mysqli->prepare("INSERT INTO items (userid, name, description, link, added_by_userid, groupid) VALUES (?, ?, ?, ?, ?, ?)");

    if ($stmt) {
        // Bind the parameters correctly
        $stmt->bind_param('ssssss', $userid, $name, $description, $link, $userid, $groupid);
        
        // Execute the statement
        if ($stmt->execute()) {
            $apiResponse = array("success" => "Item added to user $userid");
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

function getMyItemList($userid, $mysqli) {
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

function getMyReservedPurchasedItems($myuserid, $mysqli) {
    $query = "
    SELECT 
        items.*, 
        CONCAT(users.firstname, ' ', users.lastname) AS owner_name
    FROM 
        `items`
    LEFT JOIN 
        `users` 
    ON 
        items.userid = users.userid
    WHERE 
        items.status_userid = ? 
        AND items.status IN ('purchased', 'reserved')
        AND items.archive = 0
    ORDER BY 
        items.date_added ASC";
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        $stmt->bind_param("s", $myuserid);
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

function updateItemOnMyList($userid, $itemid, $description, $link, $mysqli) {
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

function updateRemovedStatusForMyItem($userid, $removed, $itemid, $mysqli) {
    $query = "UPDATE items SET removed = ? WHERE itemid = ? AND userid = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param('sis', $removed, $itemid, $userid);
    if ($stmt) {
        $stmt->execute();
        if ($stmt->affected_rows > 0) {
            $apiResponse = array("success" => "item $itemid updated");
        } else {
            $apiResponse = array("error" => "No items found for the specified user (affected rows: ".$stmt->affected_rows.").");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}

// their
function addItemToTheirList($myuserid, $theiruserid, $name, $description, $link, $groupid, $mysqli) {
    $apiResponse = '';
    $stmt = $mysqli->prepare("INSERT INTO items (userid, name, description, link, added_by_userid, status_userid, groupid, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'purchased')");
    if ($stmt) {
        // Bind the parameters correctly
        $stmt->bind_param('sssssss', $theiruserid, $name, $description, $link, $myuserid,  $myuserid, $groupid);
        
        // Execute the statement
        if ($stmt->execute()) {
            $apiResponse = array("success" => "Item added for user $theiruserid");
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
function getTheirItemList($userid, $mysqli) {
    // $query = "SELECT * FROM `items` WHERE userid = ? AND `archive` = 0 AND ((removed = 0) OR (removed = 1 AND status != 'no change')) ORDER BY date_added ASC";
    $query = "
    SELECT 
        items.*, 
        CONCAT(users.firstname, ' ', users.lastname) AS status_username
    FROM 
        `items`
    LEFT JOIN 
        `users` 
    ON 
        items.status_userid = users.userid
    WHERE 
        items.userid = ? 
        AND items.archive = 0 
        AND (
            items.removed = 0 
            OR (items.removed = 1 AND items.status != 'no change')
        )
    ORDER BY 
        items.date_added ASC";
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        $stmt->bind_param("s", $userid);
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

function updateStatusForTheirItem($myuserid, $theiruserid, $itemid, $status, $mysqli, $date_received = null) {
    // If status is purchased, date_received is required
    if ($status === 'purchased' && empty($date_received)) {
        return array("error" => "date_received is required when status is 'purchased'");
    }

    // Build query based on whether date_received is provided
    if ($status === 'purchased' && !empty($date_received)) {
        $query = "UPDATE items SET status = ?, status_userid = ?, date_received = ? WHERE itemid = ? AND userid = ?";
        $stmt = $mysqli->prepare($query);
        if ($stmt) {
            $stmt->bind_param('sssis', $status, $myuserid, $date_received, $itemid, $theiruserid);
        }
    } else {
        $query = "UPDATE items SET status = ?, status_userid = ? WHERE itemid = ? AND userid = ?";
        $stmt = $mysqli->prepare($query);
        if ($stmt) {
            $stmt->bind_param('ssis', $status, $myuserid, $itemid, $theiruserid);
        }
    }

    if ($stmt) {
        $stmt->execute();
        if ($stmt->affected_rows > 0) {
            $apiResponse = array("success" => "item $itemid updated");
        } else {
            $apiResponse = array("warn" => "No items found for the specified user (affected rows: ".$stmt->affected_rows.").");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}

// generic
function getUserProfileByUserId($userid, $mysqli) {
    $query = "SELECT userid, firstname, lastname, groupid, created, email, avatar, birthday_month, birthday_day FROM `users` WHERE userid = ? ";
    $stmt = $mysqli->prepare($query);

    if ($stmt) {
        $stmt->bind_param("s", $userid);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
          $apiResponse = array("success" => $result->fetch_all(MYSQLI_ASSOC));
        } else {
            $apiResponse = array("warn" => "No user found for userid: $userid.");
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

function updateAvatar($email_address, $avatar, $mysqli) {
    $query = "UPDATE users SET avatar = ? WHERE email = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param('ss', $avatar, $email_address);
    if ($stmt) {
        $stmt->execute();
        if ($stmt->affected_rows > 0) {
            $apiResponse = array("success" => "Avatar has been updated");
        } else {
            $apiResponse = array("error" => "Affected rows: ".$stmt->affected_rows."). Either no matching email address for $email_address or avatar was already set to $avatar.");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}

function getFacebookProfile($access_token) {
    // Get Facebook App Secret from environment variable
    $fbAppSecret = getenv('FB_APP_SECRET') ?: getenv('FB_SECRET') ?: "";
    
    if (!$fbAppSecret) {
        error_log("Facebook App Secret not configured [version=$APP_VERSION]. Please set FB_APP_SECRET environment variable.");
        return array("error" => "Facebook App Secret not configured. Please set FB_APP_SECRET environment variable.");
    }
    
    if (!$access_token) {
        return array("error" => "Access token is required.");
    }
    
    try {
        // Generate appsecret_proof using HMAC-SHA256
        $appsecret_proof = hash_hmac('sha256', $access_token, $fbAppSecret);
        
        if (!$appsecret_proof) {
            error_log("Failed to generate appsecret_proof for Facebook API call [version=$APP_VERSION]");
            return array("error" => "Failed to generate security proof for Facebook API call.");
        }
        
        // Build Facebook Graph API URL with appsecret_proof
        $graphUrl = "https://graph.facebook.com/v18.0/me?" . http_build_query(array(
            'access_token' => $access_token,
            'appsecret_proof' => $appsecret_proof,
            'fields' => 'id,name,email,picture.width(200).height(200),first_name,last_name'
        ));
        
        // Make request to Facebook Graph API with error handling
        $context = stream_context_create(array(
            'http' => array(
                'timeout' => 10,
                'ignore_errors' => true
            )
        ));
        
        $response = @file_get_contents($graphUrl, false, $context);
        
        if ($response === false) {
            $error = error_get_last();
            error_log("Failed to fetch Facebook profile [version=$APP_VERSION]: " . ($error ? $error['message'] : 'Unknown error'));
            return array("error" => "Failed to fetch Facebook profile: Unable to connect to Facebook Graph API. Check error logs for details.");
        }
        
        $result = json_decode($response, true);
        
        // Check for JSON decode errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error when fetching Facebook profile [version=$APP_VERSION]: " . json_last_error_msg());
            return array("error" => "Failed to parse Facebook API response.");
        }
        
        // Check for errors in response
        if (isset($result['error'])) {
            $errorMsg = isset($result['error']['message']) ? $result['error']['message'] : 'Unknown error';
            $errorCode = isset($result['error']['code']) ? $result['error']['code'] : 'Unknown';
            error_log("Facebook API error [version=$APP_VERSION]: Code $errorCode - $errorMsg");
            return array("error" => "Facebook API error: $errorMsg");
        }
        
        // Return success with profile data
        if (isset($result['id'])) {
            return array("success" => array($result));
        }
        
        error_log("Unexpected response from Facebook Graph API [version=$APP_VERSION]: " . substr($response, 0, 500));
        return array("error" => "Unexpected response from Facebook Graph API. Check error logs for details.");
        
    } catch (Exception $e) {
        error_log("Exception in getFacebookProfile [version=$APP_VERSION]: " . $e->getMessage());
        return array("error" => "An error occurred while fetching Facebook profile: " . $e->getMessage());
    }
}

// admin -> This will need additional check to ensure that the user is an admin
function archivePurchasedItems($userid, $mysqli) {
    // Archive purchased items for all users (not just admin userid)
    $query = "UPDATE items SET archive = 1 WHERE status = 'purchased' AND archive = 0";
    $stmt = $mysqli->prepare($query);
    if ($stmt) {
        $stmt->execute();
        if ($stmt->affected_rows > 0) {
            $apiResponse = array("success" => "Purchased items have been archived. " . $stmt->affected_rows . " items affected.");
        } else {
            $apiResponse = array("warn" => "There were no matching items.");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}
// admin
function archiveRemovedItems($userid, $mysqli) {
    // Archive removed items for all users (not just admin userid)
    $query = "UPDATE items SET archive = 1 WHERE removed = 1 AND archive = 0";
    $stmt = $mysqli->prepare($query);
    if ($stmt) {
        $stmt->execute();
        if ($stmt->affected_rows > 0) {
            $apiResponse = array("success" => "Removed items have been archived " . $stmt->affected_rows . " items affected.");
        } else {
            $apiResponse = array("warn" => "There were no matching items.");
        }
        $stmt->close();
    } else {
        $apiResponse = array("error" => "Failed to prepare the statement: (" . $mysqli->errno . ") " . $mysqli->error);
    }
    return $apiResponse;
}

?>