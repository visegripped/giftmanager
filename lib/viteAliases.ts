import { join } from 'path';

export interface ViteAlias {
  find: string;
  replacement: string;
}

/**
 * Vite equivalents of the tsconfig `paths`, shared by Vitest and Storybook.
 * Storybook needs these explicitly because tsconfig excludes story files.
 */
export function getViteAliases(root: string = process.cwd()): ViteAlias[] {
  return [
    { find: '@', replacement: root },
    { find: '@assets', replacement: join(root, 'src/assets') },
    { find: '@types', replacement: join(root, 'src/types') },
    { find: '@components', replacement: join(root, 'src/components') },
    { find: '@views', replacement: join(root, 'src/views') },
    { find: '@utilities', replacement: join(root, 'src/utilities') },
    { find: '@context', replacement: join(root, 'src/context') },
    { find: '@routes', replacement: join(root, 'src/routes') },
  ];
}
