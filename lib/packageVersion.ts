import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Read semver from package.json at build/config time only.
 * Do not import from client components — use process.env.NEXT_PUBLIC_APP_VERSION instead.
 */
export function getPackageVersion(): string {
  const pkg = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf8')
  ) as { version?: string };

  return pkg.version ?? '0.0.0';
}
