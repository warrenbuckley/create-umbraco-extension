import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Detects whether `cwd` contains an existing Umbraco backoffice extension project
 * by checking for `@umbraco-cms/backoffice` in the local `package.json`.
 *
 * @param cwd - The directory to inspect (defaults to `process.cwd()`).
 * @returns The project name from `package.json` if detected, otherwise `null`.
 */
export async function detectExistingProject(cwd: string): Promise<string | null> {
  const pkgPath = join(cwd, 'package.json');

  let raw: string;
  try {
    raw = await readFile(pkgPath, 'utf-8');
  } catch {
    // No package.json in cwd — definitely not an existing project
    return null;
  }

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Malformed package.json — treat as no project detected
    return null;
  }

  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  if (!('@umbraco-cms/backoffice' in deps)) {
    return null;
  }

  return typeof pkg.name === 'string' && pkg.name ? pkg.name : null;
}
