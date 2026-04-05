import { join } from 'node:path';
import { readPackageJson } from './utils/pkg.js';

/**
 * Detects whether `cwd` contains an existing Umbraco backoffice extension project
 * by checking for `@umbraco-cms/backoffice` in the local `package.json`.
 *
 * @param cwd - The directory to inspect (defaults to `process.cwd()`).
 * @returns The project name from `package.json` if detected, otherwise `null`.
 */
export async function detectExistingProject(cwd: string): Promise<string | null> {
  const pkg = await readPackageJson(join(cwd, 'package.json'));

  if (!pkg) return null;

  const deps = {
    ...(pkg['dependencies'] as Record<string, string> | undefined),
    ...(pkg['devDependencies'] as Record<string, string> | undefined),
  };

  if (!('@umbraco-cms/backoffice' in deps)) return null;

  return typeof pkg['name'] === 'string' && pkg['name'] ? pkg['name'] : null;
}
