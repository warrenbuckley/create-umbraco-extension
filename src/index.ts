#!/usr/bin/env node
import { runCLI } from './cli.js';

runCLI().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`\nError: ${message}\n`);
  process.exit(1);
});
