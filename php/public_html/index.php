<php header("Cache-Control: no-cache"); ?>
<?php
/**
 * Frontend router for GiftManager.
 *
 * This file stays at /home/<USER>/public_html/index.php and delegates
 * to a versioned build under public_html/releases/<version>/index.php.
 *
 * The active version is determined by:
 *   1. ?version=<version> query parameter (for canary/preview)
 *   2. $APP_VERSION defined in includes/current_version.php
 */

// Load current version information (defines $APP_VERSION and $INCLUDE_VERSION)
require_once __DIR__ . '/../includes/current_version.php';

// Query param takes precedence for previewing specific versions
$requestedVersion = isset($_GET['version']) ? trim($_GET['version']) : '';

// Basic sanitisation to avoid directory traversal etc.
if ($requestedVersion !== '' && !preg_match('/^[A-Za-z0-9._\\-]+$/', $requestedVersion)) {
    // If the requested version is invalid, ignore it
    $requestedVersion = '';
}

$targetVersion = $requestedVersion !== '' ? $requestedVersion : $APP_VERSION;

$releaseIndexPath = __DIR__ . '/releases/' . $targetVersion . '/index.php';

if (!file_exists($releaseIndexPath)) {
    // If the requested version doesn't exist, fall back to APP_VERSION
    if ($requestedVersion !== '' && $requestedVersion !== $APP_VERSION) {
        $fallbackPath = __DIR__ . '/releases/' . $APP_VERSION . '/index.php';
        if (file_exists($fallbackPath)) {
            $releaseIndexPath = $fallbackPath;
        }
    }
}

// As a final safeguard, if we still don't have a valid index path, show a simple error
if (!file_exists($releaseIndexPath)) {
    http_response_code(503);
    echo '<h1>Service temporarily unavailable</h1>';
    echo '<p>No valid frontend build is available. Please contact the site administrator.</p>';
    exit;
}

// Hand off to the versioned React build
require $releaseIndexPath;


