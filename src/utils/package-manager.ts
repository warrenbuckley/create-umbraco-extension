import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export interface PackageManagerInfo {
  name: PackageManager;
  /** Full install command, e.g. `"pnpm install"` */
  installCmd: string;
  /** Full build command, e.g. `"pnpm run build"` */
  buildCmd: string;
}

/**
 * Detects the package manager that invoked the CLI from the
 * `npm_config_user_agent` environment variable.
 *
 * All major package managers set this when running lifecycle scripts or
 * `npm init` / `pnpm dlx` / `yarn dlx` / `bunx`.
 * Falls back to `npm` when the variable is absent or unrecognised.
 */
export function detectPackageManager(): PackageManagerInfo {
  const ua = process.env['npm_config_user_agent'] ?? '';
  if (ua.startsWith('pnpm/')) return { name: 'pnpm', installCmd: 'pnpm install',  buildCmd: 'pnpm run build' };
  if (ua.startsWith('yarn/')) return { name: 'yarn', installCmd: 'yarn',           buildCmd: 'yarn build' };
  if (ua.startsWith('bun/'))  return { name: 'bun',  installCmd: 'bun install',    buildCmd: 'bun run build' };
  return                              { name: 'npm',  installCmd: 'npm install',    buildCmd: 'npm run build' };
}

/**
 * Runs the package manager's install command in the given directory.
 * Uses `exec` so the OS shell resolves the package manager binary on all platforms.
 *
 * @throws When the install process exits with a non-zero code.
 */
export async function runInstall(projectDir: string, pm: PackageManagerInfo): Promise<void> {
  await execAsync(pm.installCmd, { cwd: projectDir });
}

/**
 * Builds the multi-line "next steps" string shown in the outro note.
 *
 * @param projectDirName - The directory name to `cd` into, e.g. `"my-plugin"`.
 * @param pm             - Detected package manager.
 * @param installed      - Whether dependencies were already installed by the CLI.
 */
export function nextStepsMessage(
  projectDirName: string,
  pm: PackageManagerInfo,
  installed: boolean,
): string {
  const lines = [`cd ${projectDirName}`];
  if (!installed) lines.push(pm.installCmd);
  lines.push(pm.buildCmd);
  return lines.join('\n');
}
