// Copies src/templates/ → dist/templates/ after tsc compilation.
// scaffold/ and example/ subdirectories are excluded from tsc and shipped verbatim.
// generator.ts files at the type root are compiled by tsc — skip them here.
import { cpSync } from 'node:fs';

cpSync('src/templates', 'dist/templates', {
  recursive: true,
  filter: (src) => !src.endsWith('/generator.ts'),
});
console.log('✔ Templates copied to dist/templates/');
