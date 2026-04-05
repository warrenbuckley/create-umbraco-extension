// Copies src/templates/ → dist/templates/ after tsc compilation.
// Template files are not compiled by tsc (excluded in tsconfig.json) — they are
// shipped as-is so the CLI can read them at runtime via loadTemplate().
import { cpSync } from 'node:fs';

cpSync('src/templates', 'dist/templates', { recursive: true });
console.log('✔ Templates copied to dist/templates/');
