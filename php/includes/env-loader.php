<?php
/**
 * Lightweight .env loader for PHP endpoints.
 *
 * Loads environment variables from the first readable file in the following order:
 * 1. .env.production.local
 * 2. .env.production
 * 3. .env.local
 * 4. .env
 *
 * Values already defined in the environment are never overridden. This ensures
 * production servers that explicitly export secrets keep precedence while still
 * letting us fall back to the committed production defaults.
 */

if (!function_exists('gmLoadEnv')) {
    function gmLoadEnv(): void
    {
        static $envLoaded = false;

        if ($envLoaded) {
            return;
        }

        $primaryRoot = dirname(__DIR__); // handles prod where includes/ is top-level
        $fallbackRoot = dirname($primaryRoot); // handles repo layout where includes/ lives under php/
        $rootsToCheck = array_unique([$primaryRoot, $fallbackRoot]);

        foreach ($rootsToCheck as $root) {
            if (!$root || $root === DIRECTORY_SEPARATOR) {
                continue;
            }

            $envFiles = [
                $root . '/.env.production.local',
                $root . '/.env.production',
                $root . '/.env.local',
                $root . '/.env',
            ];

            foreach ($envFiles as $envFile) {
                if (!is_readable($envFile)) {
                    continue;
                }

                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                if (!$lines) {
                    continue;
                }

                foreach ($lines as $line) {
                    $trimmed = trim($line);

                    if ($trimmed === '' || strpos($trimmed, '#') === 0) {
                        continue;
                    }

                    if (stripos($trimmed, 'export ') === 0) {
                        $trimmed = trim(substr($trimmed, 7));
                    }

                    if (strpos($trimmed, '=') === false) {
                        continue;
                    }

                    [$key, $value] = explode('=', $trimmed, 2);
                    $key = trim($key);
                    $value = ltrim($value);

                    if ($value === '') {
                        $value = '';
                    } elseif ($value[0] === '"' || $value[0] === "'") {
                        $quote = $value[0];
                        $endPos = strpos($value, $quote, 1);
                        if ($endPos === false) {
                            $value = substr($value, 1);
                        } else {
                            $value = substr($value, 1, $endPos - 1);
                        }
                        $value = str_replace('\\' . $quote, $quote, $value);
                    } else {
                        $hashPos = strpos($value, ' #');
                        if ($hashPos !== false) {
                            $value = substr($value, 0, $hashPos);
                        }
                        $value = trim($value);
                    }

                    if ($key === '' || $value === '' || getenv($key) !== false) {
                        continue;
                    }

                    putenv("$key=$value");
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }

                // Stop after the first readable env file to mimic Vite precedence
                $envLoaded = true;
                return;
            }
        }

        // Mark as loaded even if no files were found to avoid re-scanning
        $envLoaded = true;
    }
}

/**
 * Get environment variable from multiple sources (getenv, $_ENV, $_SERVER)
 * This ensures compatibility with different PHP configurations and Docker setups
 */
if (!function_exists('gmGetEnv')) {
    function gmGetEnv($key, $default = false) {
        // Try getenv() first (works with Docker environment variables)
        $value = getenv($key);
        if ($value !== false) {
            return $value;
        }
        // Try $_ENV (if variables_order includes 'E')
        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }
        // Try $_SERVER (if variables_order includes 'S')
        if (isset($_SERVER[$key])) {
            return $_SERVER[$key];
        }
        return $default;
    }
}
?>

