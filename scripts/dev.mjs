/**
 * Cross-platform dev runner.
 * Resolves the system temp directory so the --cwd path works on Windows,
 * macOS, and Linux without hardcoding /tmp.
 */
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const fresh = process.argv.includes('--fresh');
const devDir = join(tmpdir(), 'umb-dev');

if (fresh) {
  const { rmSync } = await import('node:fs');
  rmSync(devDir, { recursive: true, force: true });
}

console.log('\x1b[2m[DEBUG] Output directory:', devDir, '\x1b[0m');

const node = process.execPath;
const cli = join(import.meta.dirname, '..', 'dist', 'index.js');

const child = spawn(node, [cli, '--cwd', devDir], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
