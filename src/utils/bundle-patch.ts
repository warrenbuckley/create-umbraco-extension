import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { toCamelCase } from './strings.js';

export interface BundlePatchResult {
  /** Whether the file was actually modified. False on dry-run or if already registered. */
  patched: boolean;
  /** The import path that was (or would be) added, e.g. `"./dashboards/my-dashboard/manifest.js"`. */
  importPath: string;
  /** The import alias that was (or would be) used, e.g. `"myDashboard"`. */
  alias: string;
}

/**
 * Patches `src/bundle.manifests.ts` in an existing project to register a
 * newly generated extension manifest.
 *
 * Inserts an import statement after the last existing import and appends a
 * `...spread` entry at the end of the manifests array. The operation is
 * idempotent — if the import path is already present the file is unchanged.
 *
 * @param outputDir    - Absolute path to the project root.
 * @param manifestPath - Project-relative path of the generated manifest file,
 *                       e.g. `"src/dashboards/my-dashboard/manifest.ts"`.
 * @param dryRun       - When `true`, returns what would change without writing.
 */
export async function patchBundleManifests(
  outputDir: string,
  manifestPath: string,
  dryRun: boolean,
): Promise<BundlePatchResult> {
  // 'src/dashboards/my-dashboard/manifest.ts' → './dashboards/my-dashboard/manifest.js'
  const importPath = './' + manifestPath
    .replace(/\\/g, '/')
    .replace(/^src\//, '')
    .replace(/\.ts$/, '.js');

  // 'src/dashboards/my-dashboard/manifest.ts' → folder 'my-dashboard' → alias 'myDashboard'
  const segments = manifestPath.replace(/\\/g, '/').split('/');
  const alias = toCamelCase(segments.at(-2) ?? 'extension');

  if (dryRun) {
    return { patched: false, importPath, alias };
  }

  const bundlePath = join(outputDir, 'src', 'bundle.manifests.ts');
  let content: string;
  try {
    content = await readFile(bundlePath, 'utf-8');
  } catch {
    // bundle.manifests.ts not found — new project or non-standard layout, skip silently
    return { patched: false, importPath, alias };
  }

  // Idempotency: already registered
  if (content.includes(importPath)) {
    return { patched: false, importPath, alias };
  }

  const lines = content.split('\n');
  const importStatement = `import { manifests as ${alias} } from '${importPath}';`;

  // Find the last import line and the closing `];` — scan in one pass
  let lastImportIndex = -1;
  let closingIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImportIndex = i;
    if (lines[i].trim() === '];') closingIndex = i;
  }

  // Insert bottom-first so the earlier index stays valid
  if (closingIndex !== -1) {
    lines.splice(closingIndex, 0, `  ...${alias},`);
  }
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
  }

  await writeFile(bundlePath, lines.join('\n'), 'utf-8');
  return { patched: true, importPath, alias };
}
