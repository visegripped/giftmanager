<?php
// Report Database Credentials Example
// Copy this file to report-credentials.php and fill in your values
// report-credentials.php is already in .gitignore and will not be committed

// For production: Set these values directly
// For Docker/local: Use environment variables (set in docker-compose.yml or .env file)

$database = getenv('REPORT_DB_NAME') ?: "your_report_database_name";
$username = getenv('REPORT_DB_USER') ?: "your_username";
$password = getenv('REPORT_DB_PASSWORD') ?: "your_password";
?>



