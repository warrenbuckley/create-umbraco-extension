import { join, basename } from 'node:path';
import { readPackageJson } from './utils/pkg.js';

/**
 * Detects whether `cwd` contains an existing Umbraco backoffice extension project
 * by checking for `@umbraco-cms/backoffice` in the local `package.json`.
 *
 * @returns The project name (from `package.json` or the directory name as fallback),
 *          or `null` if no Umbraco project is detected.
 */
export async function detectExistingProject(cwd: string): Promise<string | null> {
  const pkg = await readPackageJson(join(cwd, 'package.json'));

  if (!pkg) return null;

  const deps = {
    ...(pkg['dependencies'] as Record<string, string> | undefined),
    ...(pkg['devDependencies'] as Record<string, string> | undefined),
  };

  if (!('@umbraco-cms/backoffice' in deps)) return null;

  // Fall back to the directory name when package.json has no name (private packages)
  return typeof pkg['name'] === 'string' && pkg['name'] ? pkg['name'] : basename(cwd);
}

/**
 * Attempts to detect the alias prefix used in an existing project by reading
 * `public/umbraco-package.json` and stripping the `.Bundle` suffix from the
 * bundle extension's alias (e.g. `My.Plugin.Bundle` → `My.Plugin`).
 *
 * @returns The alias prefix if detected, otherwise `undefined`.
 */
export async function detectAliasPrefix(cwd: string): Promise<string | undefined> {
  const pkg = await readPackageJson(join(cwd, 'public', 'umbraco-package.json'));

  if (!pkg) return undefined;

  const extensions = pkg['extensions'];
  if (!Array.isArray(extensions)) return undefined;

  const bundle = extensions.find(
    (e): e is Record<string, unknown> =>
      typeof e === 'object' && e !== null && e['type'] === 'bundle',
  );

  const alias = bundle?.['alias'];
  if (typeof alias !== 'string' || !alias.endsWith('.Bundle')) return undefined;

  return alias.slice(0, -'.Bundle'.length);
}
