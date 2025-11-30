<?php

/**
 * AI Functions for Gift Manager
 * Handles OpenAI API integration for gift recommendations and enhancements
 */

/**
 * Call OpenAI API to get gift recommendations based on user history
 * 
 * @param int $userid The user ID to get recommendations for
 * @param mysqli $mysqli Database connection
 * @param int $limit Number of recommendations to return (default 10)
 * @return array API response with recommendations or error
 */
function getGiftRecommendations($userid, $mysqli, $limit = 10) {
    // Get OpenAI API key from environment
    $openaiApiKey = getenv('OPENAI_API_KEY');
    if (empty($openaiApiKey)) {
        return array("error" => "OpenAI API key not configured");
    }

    // Get user's item history
    $query = "SELECT name, description, link, status, date_added, date_received 
              FROM items 
              WHERE userid = ? AND archive = 0 
              ORDER BY date_added DESC 
              LIMIT 50";
    $stmt = $mysqli->prepare($query);
    
    if (!$stmt) {
        return array("error" => "Failed to prepare statement: " . $mysqli->error);
    }

    $stmt->bind_param("s", $userid);
    $stmt->execute();
    $result = $stmt->get_result();
    $items = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // Get user profile for context
    $userQuery = "SELECT firstname, lastname, birthday_month, birthday_day 
                  FROM users 
                  WHERE userid = ?";
    $userStmt = $mysqli->prepare($userQuery);
    $userStmt->bind_param("s", $userid);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    $userProfile = $userResult->fetch_assoc();
    $userStmt->close();

    if (empty($items)) {
        return array("warn" => "Not enough gift history to generate recommendations");
    }

    // Build context for AI
    $itemHistory = array();
    foreach ($items as $item) {
        $itemHistory[] = array(
            "name" => $item['name'],
            "description" => $item['description'] ?? "",
            "status" => $item['status'] ?? "",
        );
    }

    $userName = ($userProfile['firstname'] ?? '') . ' ' . ($userProfile['lastname'] ?? '');
    $birthdayInfo = "";
    if (!empty($userProfile['birthday_month']) && !empty($userProfile['birthday_day'])) {
        $birthdayInfo = " Birthday: Month {$userProfile['birthday_month']}, Day {$userProfile['birthday_day']}.";
    }

    // Build the prompt
    $prompt = "Based on the following gift wishlist history for {$userName}, suggest {$limit} personalized gift recommendations.{$birthdayInfo}

Gift History:
" . json_encode($itemHistory, JSON_PRETTY_PRINT) . "

Please provide gift recommendations in JSON format with the following structure:
{
  \"recommendations\": [
    {
      \"name\": \"Gift Name\",
      \"description\": \"Why this gift would be appreciated\",
      \"category\": \"Category (e.g., Electronics, Books, Clothing)\",
      \"reason\": \"Brief explanation based on their history\"
    }
  ]
}

Focus on gifts that align with their interests shown in the history. Be specific and thoughtful.";

    // Call OpenAI API
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: Bearer ' . $openaiApiKey
    ));

    $payload = array(
        'model' => 'gpt-4o-mini', // Using cheaper model, can be changed to gpt-4-turbo for better quality
        'messages' => array(
            array(
                'role' => 'system',
                'content' => 'You are a helpful gift recommendation assistant. Always respond with valid JSON only.'
            ),
            array(
                'role' => 'user',
                'content' => $prompt
            )
        ),
        'temperature' => 0.7,
        'max_tokens' => 1000
    );

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return array("error" => "OpenAI API error: HTTP $httpCode");
    }

    $responseData = json_decode($response, true);
    
    if (!isset($responseData['choices'][0]['message']['content'])) {
        return array("error" => "Invalid response from OpenAI API");
    }

    $content = $responseData['choices'][0]['message']['content'];
    
    // Extract JSON from response (handle cases where AI adds extra text)
    $jsonStart = strpos($content, '{');
    $jsonEnd = strrpos($content, '}');
    
    if ($jsonStart === false || $jsonEnd === false) {
        return array("error" => "Could not parse AI response");
    }

    $jsonContent = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
    $recommendations = json_decode($jsonContent, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return array("error" => "JSON parse error: " . json_last_error_msg());
    }

    return array("success" => $recommendations['recommendations'] ?? array());
}

/**
 * Enhance item description using AI
 * 
 * @param string $name Item name
 * @param string $description Current description (may be empty)
 * @param string $link Optional link to product
 * @return string Enhanced description
 */
function enhanceItemDescription($name, $description = "", $link = "") {
    $openaiApiKey = getenv('OPENAI_API_KEY');
    if (empty($openaiApiKey)) {
        return $description; // Return original if API not configured
    }

    // If description is already good (more than 20 chars), return as-is
    if (strlen($description) > 20) {
        return $description;
    }

    $prompt = "Generate a helpful, concise description (2-3 sentences) for this gift item: \"{$name}\"";
    if (!empty($link)) {
        $prompt .= " Link: {$link}";
    }
    if (!empty($description)) {
        $prompt .= " Current description: \"{$description}\" - enhance this if needed.";
    }
    $prompt .= " Make it informative and appealing. Return only the description text, no JSON or extra formatting.";

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: Bearer ' . $openaiApiKey
    ));

    $payload = array(
        'model' => 'gpt-4o-mini',
        'messages' => array(
            array(
                'role' => 'system',
                'content' => 'You are a helpful assistant that generates product descriptions. Return only the description text.'
            ),
            array(
                'role' => 'user',
                'content' => $prompt
            )
        ),
        'temperature' => 0.7,
        'max_tokens' => 150
    );

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $responseData = json_decode($response, true);
        if (isset($responseData['choices'][0]['message']['content'])) {
            $enhanced = trim($responseData['choices'][0]['message']['content']);
            // Remove any quotes if AI wrapped the response
            $enhanced = trim($enhanced, '"\'');
            return $enhanced;
        }
    }

    // Fallback to original description
    return $description;
}

/**
 * Check for duplicate items using AI embeddings
 * For now, uses a simple text similarity approach
 * Can be enhanced with OpenAI embeddings API later
 * 
 * @param string $name Item name to check
 * @param string $description Item description
 * @param int $userid User ID
 * @param mysqli $mysqli Database connection
 * @return array|null Duplicate item if found, null otherwise
 */
function checkForDuplicateItem($name, $description, $userid, $mysqli) {
    // Get existing items for this user
    $query = "SELECT itemid, name, description, removed 
              FROM items 
              WHERE userid = ? AND archive = 0 AND removed = 0
              ORDER BY date_added DESC 
              LIMIT 20";
    $stmt = $mysqli->prepare($query);
    
    if (!$stmt) {
        return null; // Don't block on error
    }

    $stmt->bind_param("s", $userid);
    $stmt->execute();
    $result = $stmt->get_result();
    $existingItems = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    if (empty($existingItems)) {
        return null;
    }

    // Simple similarity check using Levenshtein distance
    $newItemText = strtolower($name . ' ' . $description);
    $threshold = 0.7; // 70% similarity threshold

    foreach ($existingItems as $item) {
        $existingText = strtolower($item['name'] . ' ' . ($item['description'] ?? ''));
        
        // Calculate similarity
        $similarity = 0;
        similar_text($newItemText, $existingText, $similarity);
        
        if ($similarity >= ($threshold * 100)) {
            return $item; // Found a potential duplicate
        }
    }

    return null;
}

?>

