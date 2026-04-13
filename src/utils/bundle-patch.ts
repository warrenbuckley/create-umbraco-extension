import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { toCamelCase } from './strings.js';

export interface BundlePatchResult {
  /** Whether the file was actually modified. False on dry-run or if already registered. */
  patched: boolean;
  /** The import path that was (or would be) added, e.g. `"./dashboards/my-dashboard.manifest.js"`. */
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
  // 'src/dashboards/my-dashboard.manifest.ts' → './dashboards/my-dashboard.manifest.js'
  const importPath = './' + manifestPath
    .replace(/\\/g, '/')
    .replace(/^src\//, '')
    .replace(/\.ts$/, '.js');

  // 'src/dashboards/my-dashboard.manifest.ts' → 'my-dashboard' → 'myDashboard'
  const fileName = manifestPath.replace(/\\/g, '/').split('/').at(-1) ?? 'extension';
  const alias = toCamelCase(fileName.replace(/\.manifest\.ts$/, ''));

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

  const importStatement = `import { manifests as ${alias} } from '${importPath}';`;

  // Insert import after the last existing import line
  const lines = content.split('\n');
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImportIndex = i;
  }
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
  }
  content = lines.join('\n');

  // Insert spread into the manifests array — handle both `= [];` and multiline `= [\n  ...\n];`
  if (content.includes('= [];')) {
    content = content.replace('= [];', `= [\n  ...${alias},\n];`);
  } else {
    const patched = content.split('\n');
    let closingIndex = -1;
    for (let i = patched.length - 1; i >= 0; i--) {
      if (patched[i].trim() === '];') { closingIndex = i; break; }
    }
    if (closingIndex !== -1) {
      patched.splice(closingIndex, 0, `  ...${alias},`);
    }
    content = patched.join('\n');
  }

  await writeFile(bundlePath, content, 'utf-8');
  return { patched: true, importPath, alias };
}
