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
 *
 * Example:
 *   require gm_get_include_path('api-credentials.php');
 */
function gm_get_include_path($relativePath)
{
    global $INCLUDE_VERSION;

    $relativePath = ltrim($relativePath, '/');

    // __DIR__ points at /home/<USER>/includes on the server
    return __DIR__ . '/releases/' . $INCLUDE_VERSION . '/' . $relativePath;
}


