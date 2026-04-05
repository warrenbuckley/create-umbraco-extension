import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** A resolved Umbraco major version available for scaffolding. */
export interface UmbracoVersion {
  /** Major version number. */
  major: number;
  /** Display label shown in the version prompt, e.g. "17 — latest". */
  label: string;
  /** Semver range written into the scaffolded package.json, e.g. "^17.0.0". */
  packageVersion: string;
}

/**
 * Hardcoded fallback used when npm is unavailable or the network request fails.
 * Update this list when new Umbraco major versions are released.
 */
const FALLBACK_VERSIONS: UmbracoVersion[] = [
  { major: 17, label: '17 — latest', packageVersion: '^17.0.0' },
  { major: 16, label: '16',          packageVersion: '^16.0.0' },
  { major: 15, label: '15',          packageVersion: '^15.0.0' },
];

/**
 * Fetches available `@umbraco-cms/backoffice` versions from the npm registry
 * by reading the package's dist-tags, then builds a prompt-ready version list
 * with the `latest` tag clearly identified.
 *
 * Falls back to {@link FALLBACK_VERSIONS} silently if npm is unreachable.
 *
 * @returns A list of versions ordered newest-first, ready for a `@clack/prompts` select.
 */
export async function fetchUmbracoVersions(): Promise<UmbracoVersion[]> {
  try {
    const { stdout } = await execFileAsync('npm', [
      'view',
      '@umbraco-cms/backoffice',
      'dist-tags',
      '--json',
    ]);

    const distTags = JSON.parse(stdout) as Record<string, string>;
    const latestVersion = distTags['latest'] ?? '';
    const latestMajor = latestVersion ? parseInt(latestVersion.split('.')[0], 10) : 0;

    if (!latestMajor) return FALLBACK_VERSIONS;

    // Build a list of the three most recent majors
    const versions: UmbracoVersion[] = [];
    for (let major = latestMajor; major >= Math.max(latestMajor - 2, 1); major--) {
      versions.push({
        major,
        label: major === latestMajor ? `${major} — latest` : `${major}`,
        packageVersion: `^${major}.0.0`,
      });
    }

    return versions;
  } catch {
    // npm unavailable, offline, or package not found — use the hardcoded fallback
    return FALLBACK_VERSIONS;
  }
}
