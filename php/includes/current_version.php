<?php
/**
 * Current application/version configuration for PHP.
 *
 * This file is intended to be updated by the deploy script on the server
 * to reflect the currently active backend version. For local development
 * it falls back to environment variables or a static default.
 */

// Fallbacks for local/dev environments – on the server, deploy.js will
// overwrite this file with the exact version being deployed.
if (!isset($APP_VERSION)) {
    $APP_VERSION = getenv('APP_VERSION') ?: '1.0.0';
}

if (!isset($INCLUDE_VERSION)) {
    // By default, use the same value for include path versioning
    $INCLUDE_VERSION = $APP_VERSION;
}

/**
 * Helper to build a versioned include path relative to the includes root.
 * Falls back to direct path if versioned path doesn't exist (for local development).
 *
 * Use this for versioned code files (e.g., api-functions.php, graphql-schema.php)
 * 
 * Example:
 *   require gm_get_include_path('api-functions.php');
 */
function gm_get_include_path($relativePath)
{
    global $INCLUDE_VERSION;

    $relativePath = ltrim($relativePath, '/');

    // Try versioned path first (for production)
    $versionedPath = __DIR__ . '/releases/' . $INCLUDE_VERSION . '/' . $relativePath;
    
    // If versioned path exists, use it; otherwise fall back to direct path (for local dev)
    if (file_exists($versionedPath)) {
        return $versionedPath;
    }
    
    // Fallback to direct path for local development
    return __DIR__ . '/' . $relativePath;
}

/**
 * Helper to get credentials file path from the root includes folder.
 * 
 * Credentials should NEVER be versioned. They always come from the root includes
 * directory to ensure they are maintained in one location and not accidentally
 * committed to version control.
 * 
 * Example:
 *   require gm_get_credentials_path('api-credentials.php');
 */
function gm_get_credentials_path($relativePath)
{
    $relativePath = ltrim($relativePath, '/');
    
    // Always load credentials from root includes folder (never from versioned releases)
    return __DIR__ . '/' . $relativePath;
}


