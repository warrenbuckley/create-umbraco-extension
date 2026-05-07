/**
 * End-to-end verification script.
 *
 * 1. Scaffolds a fresh project using generateProject() + writeFiles()
 * 2. Adds a dashboard extension via the non-interactive CLI
 * 3. Runs `npm install` in the scaffolded directory
 * 4. Runs `npm run build` (vite build)
 * 5. Confirms the App_Plugins output directory exists
 *
 * Run after `npm run build`:
 *   node scripts/test-e2e.mjs
 */

import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';

// ─── Config ──────────────────────────────────────────────────────────────────

const PROJECT_NAME   = 'my-test-plugin';
const ALIAS_PREFIX   = 'My.Test';
const UMBRACO_VERSION = '17';
const E2E_DIR        = join(tmpdir(), 'umb-e2e-test');
const PROJECT_DIR    = join(E2E_DIR, PROJECT_NAME);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function step(msg) {
  console.log(`\n\x1b[36m▶ ${msg}\x1b[0m`);
}

function ok(msg) {
  console.log(`\x1b[32m✔ ${msg}\x1b[0m`);
}

function fail(msg) {
  console.error(`\x1b[31m✖ ${msg}\x1b[0m`);
  process.exit(1);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

step('Cleaning up previous E2E run');
rmSync(E2E_DIR, { recursive: true, force: true });
await mkdir(E2E_DIR, { recursive: true });
ok(`Clean dir: ${E2E_DIR}`);

// ── Step 1: Scaffold new project ──────────────────────────────────────────────
step('Scaffolding new project via generateProject()');
const { generateProject } = await import('../dist/templates/project/generator.js');
const files = await generateProject(PROJECT_NAME, ALIAS_PREFIX, `^${UMBRACO_VERSION}.0.0`);

for (const file of files) {
  const fullPath = join(PROJECT_DIR, file.path);
  await mkdir(join(fullPath, '..'), { recursive: true });
  await writeFile(fullPath, file.content, 'utf-8');
  console.log(`  wrote ${file.path}`);
}
ok(`Project scaffolded to ${PROJECT_DIR}`);

// ── Step 2: Add a dashboard extension ────────────────────────────────────────
step('Adding dashboard extension via CLI');
const node = process.execPath;
const cli  = join(import.meta.dirname, '..', 'dist', 'index.js');

await run(node, [
  cli,
  '--type', 'dashboard',
  '--name', 'My Test Dashboard',
  '--prefix', ALIAS_PREFIX,
  '--umbraco-version', UMBRACO_VERSION,
  '--example',
  '--cwd', PROJECT_DIR,
], E2E_DIR);
ok('Dashboard extension added');

// ── Step 3: npm install ───────────────────────────────────────────────────────
step('Running npm install');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
await run(npm, ['install'], PROJECT_DIR);
ok('Dependencies installed');

// ── Step 4: vite build ────────────────────────────────────────────────────────
step('Running npm run build (vite build)');
await run(npm, ['run', 'build'], PROJECT_DIR);
ok('Build succeeded');

// ── Step 5: Verify output ─────────────────────────────────────────────────────
step('Verifying App_Plugins output');
const expectedOutput = join(PROJECT_DIR, 'wwwroot', 'App_Plugins', PROJECT_NAME);
if (!existsSync(expectedOutput)) {
  fail(`Expected output directory not found: ${expectedOutput}`);
}
ok(`Output exists: ${expectedOutput}`);

console.log('\n\x1b[32m\x1b[1m✔ End-to-end verification passed\x1b[0m\n');
