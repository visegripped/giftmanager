import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getViteAliases } from './viteAliases';

describe('getViteAliases', () => {
  it('resolves aliases against the provided root', () => {
    const aliases = getViteAliases('/project');

    expect(aliases).toContainEqual({ find: '@', replacement: '/project' });
    expect(aliases).toContainEqual({
      find: '@components',
      replacement: join('/project', 'src/components'),
    });
  });

  it('defaults to the current working directory', () => {
    const aliases = getViteAliases();

    expect(aliases.find((alias) => alias.find === '@')?.replacement).toBe(
      process.cwd()
    );
  });

  it('covers every tsconfig path alias', () => {
    const tsconfig = JSON.parse(
      readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf8')
    ) as { compilerOptions: { paths: Record<string, string[]> } };
    const tsconfigAliases = Object.keys(tsconfig.compilerOptions.paths).map(
      (key) => key.replace('/*', '')
    );

    expect(
      getViteAliases()
        .map((alias) => alias.find)
        .sort()
    ).toEqual(tsconfigAliases.sort());
  });
});
