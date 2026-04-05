import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { UmbracoExtensionGenerator } from './types.js';
import { readPackageJson } from './utils/pkg.js';

/**
 * The shape of `.create-umbraco-extension.config.js` when loaded.
 * Only the `generators` field is read — everything else is ignored.
 */
interface DiscoverConfig {
  generators?: string[];
}

/**
 * Normalises a generator module's default export into an array of generators.
 * Accepts either a single generator or an array.
 */
function normaliseExport(raw: unknown): UmbracoExtensionGenerator[] {
  if (!raw || typeof raw !== 'object') return [];
  if (Array.isArray(raw)) return raw.filter(isGenerator);
  if (isGenerator(raw)) return [raw];
  return [];
}

function isGenerator(value: unknown): value is UmbracoExtensionGenerator {
  if (!value || typeof value !== 'object') return false;
  const g = value as Record<string, unknown>;
  return (
    typeof g['type'] === 'string' &&
    typeof g['name'] === 'string' &&
    typeof g['description'] === 'string' &&
    typeof g['questions'] === 'function' &&
    typeof g['generate'] === 'function'
  );
}

/**
 * Dynamically imports a generator module and returns its generators.
 * Returns an empty array if the module is missing, broken, or has the wrong shape.
 *
 * @param specifier - An absolute file path or resolvable npm package specifier.
 */
async function loadModule(specifier: string): Promise<UmbracoExtensionGenerator[]> {
  try {
    // Convert absolute paths to file:// URLs so Node ESM loader accepts them
    const url = specifier.startsWith('/') || /^[A-Za-z]:\\/.test(specifier)
      ? pathToFileURL(specifier).href
      : specifier;

    const mod = await import(url) as { default?: unknown };
    return normaliseExport(mod.default);
  } catch {
    return [];
  }
}

/**
 * Scans all direct entries in `node_modules` (including scoped packages under
 * `@org/package`) and calls `visit` for each `package.json` found.
 */
async function scanNodeModules(
  nodeModulesDir: string,
  visit: (pkgJson: Record<string, unknown>, pkgDir: string) => Promise<void>,
): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(nodeModulesDir);
  } catch {
    return; // No node_modules — nothing to scan
  }

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;

    if (entry.startsWith('@')) {
      // Scoped package directory — one more level to read
      const scopeDir = join(nodeModulesDir, entry);
      let scopedEntries: string[];
      try {
        scopedEntries = await readdir(scopeDir);
      } catch {
        continue;
      }
      for (const scopedEntry of scopedEntries) {
        const pkgDir = join(scopeDir, scopedEntry);
        const pkgJson = await readPackageJson(join(pkgDir, 'package.json'));
        if (pkgJson) await visit(pkgJson, pkgDir);
      }
    } else {
      const pkgDir = join(nodeModulesDir, entry);
      const pkgJson = await readPackageJson(join(pkgDir, 'package.json'));
      if (pkgJson) await visit(pkgJson, pkgDir);
    }
  }
}

/**
 * Discovers all available generators by merging three sources in priority order
 * (highest to lowest): config file → `umbracoGenerator` field → npm keyword scan.
 *
 * Built-in generators are passed in as `builtIns` and serve as the lowest-priority
 * fallback. Any discovered generator with the same `type` as a built-in silently
 * replaces it — allowing installed packages to override or extend CLI defaults.
 *
 * @param cwd      - The working directory to search (defaults to `process.cwd()`).
 * @param builtIns - The CLI's own built-in generators, used as the base layer.
 * @returns        A deduplicated list of generators, ordered for display (group order
 *                 preserved, built-ins first within each priority tier).
 */
export async function discoverGenerators(
  cwd: string,
  builtIns: UmbracoExtensionGenerator[],
): Promise<UmbracoExtensionGenerator[]> {
  // Use a Map keyed by type so later entries (higher priority) silently overwrite earlier ones
  const merged = new Map<string, UmbracoExtensionGenerator>();

  // --- Lowest priority: built-ins ---
  for (const g of builtIns) {
    merged.set(g.type, g);
  }

  // --- Single pass over node_modules — collect keyword and field generators separately,
  //     then merge in priority order (keyword < umbracoGenerator field) ---
  const keywordGenerators: UmbracoExtensionGenerator[] = [];
  const fieldGenerators: UmbracoExtensionGenerator[] = [];
  const nodeModulesDir = join(cwd, 'node_modules');

  await scanNodeModules(nodeModulesDir, async (pkgJson, pkgDir) => {
    // Priority 3: npm keyword scan
    const keywords = pkgJson['keywords'];
    if (Array.isArray(keywords) && keywords.includes('umbraco-extension-generator')) {
      const main = (pkgJson['main'] as string | undefined) ?? 'index.js';
      const generators = await loadModule(resolve(pkgDir, main));
      keywordGenerators.push(...generators);
    }

    // Priority 2: umbracoGenerator field
    // Includes @umbraco-cms/backoffice itself — the self-updating mechanism
    const generatorField = pkgJson['umbracoGenerator'];
    if (typeof generatorField === 'string') {
      const generators = await loadModule(resolve(pkgDir, generatorField));
      fieldGenerators.push(...generators);
    }
  });

  for (const g of keywordGenerators) {
    merged.set(g.type, g);
  }
  for (const g of fieldGenerators) {
    merged.set(g.type, g);
  }

  // --- Priority 1 (highest): config file ---
  // .create-umbraco-extension.config.js lists npm packages or local file paths.
  // Its default export is { generators: string[] }, not generators directly.
  const configPath = join(cwd, '.create-umbraco-extension.config.js');
  const configGenerators: UmbracoExtensionGenerator[] = [];

  try {
    const rawConfig = await import(pathToFileURL(configPath).href) as { default?: unknown };
    const config = rawConfig.default as DiscoverConfig | undefined;
    if (config?.generators && Array.isArray(config.generators)) {
      for (const specifier of config.generators) {
        if (typeof specifier !== 'string') continue;

        // Resolve local paths relative to cwd; npm package names are passed as-is
        const resolvedSpecifier = specifier.startsWith('.')
          ? resolve(cwd, specifier)
          : specifier;

        const generators = await loadModule(resolvedSpecifier);
        configGenerators.push(...generators);
      }
    }
  } catch {
    // No config file or malformed — silently skip
  }

  for (const g of configGenerators) {
    merged.set(g.type, g);
  }

  return Array.from(merged.values());
}
