<?php
// API Database Credentials Example
// Copy this file to api-credentials.php and fill in your values
// api-credentials.php is already in .gitignore and will not be committed

// For production: Set these values directly
// For Docker/local: Use environment variables (set in docker-compose.yml or .env file)

$database = getenv('DB_NAME') ?: "your_database_name";
$username = getenv('DB_USER') ?: "your_username";
$password = getenv('DB_PASSWORD') ?: "your_password";
?>



