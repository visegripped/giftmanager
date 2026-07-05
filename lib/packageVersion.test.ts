import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getPackageVersion } from './packageVersion';

describe('getPackageVersion', () => {
  it('returns the version from package.json', () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    ) as { version: string };

    expect(getPackageVersion()).toBe(pkg.version);
  });
});
