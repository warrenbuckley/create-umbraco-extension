import { readFile } from 'node:fs/promises';

/**
 * Reads and parses a `package.json` file from the given path.
 * Returns `null` if the file is missing, unreadable, or contains invalid JSON.
 *
 * @param pkgJsonPath - Absolute path to the `package.json` file.
 */
export async function readPackageJson(pkgJsonPath: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readFile(pkgJsonPath, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
