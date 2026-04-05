/**
 * A single file to be written to disk by a generator.
 */
export interface GeneratedFile {
  /**
   * Path relative to the output directory.
   * @example "src/extensions/my-dashboard/manifests.ts"
   */
  path: string;

  /** The full text content of the file. */
  content: string;
}

/**
 * Context passed to every generator's `questions` and `generate` functions.
 * Provides the resolved project-level values collected during the CLI prompts.
 */
export interface GeneratorContext {
  /**
   * The npm package name of the project being scaffolded.
   * Used as the base for element tag names and file paths.
   * @example "my-plugin"
   */
  projectName: string;

  /**
   * The dot-separated alias prefix used to namespace all Umbraco extension aliases.
   * @example "My.Plugin"
   */
  aliasPrefix: string;

  /**
   * The human-readable name of the specific extension being generated.
   * Used to derive the alias, class name, and tag name for this extension.
   * @example "My Dashboard"
   */
  extensionName: string;

  /**
   * Absolute path to the directory where files will be written.
   * Generators should produce paths relative to this directory via `GeneratedFile.path`.
   */
  outputDir: string;

  /**
   * When `true`, generators should produce a richer, commented starting point.
   * When `false`, generators should produce the bare minimum files with `TODO` comments.
   */
  withExample: boolean;
}

/**
 * The interface every built-in and third-party Umbraco extension generator must implement.
 *
 * Built-in generators use `export default`. Third-party generators can export either a single
 * default or an array: `export default [gen1, gen2]`.
 *
 * @example
 * ```typescript
 * import type { UmbracoExtensionGenerator } from 'create-umbraco-extension/types';
 *
 * export default {
 *   type: 'myCustomType',
 *   name: 'My Custom Type',
 *   description: 'Scaffolds a custom extension type',
 *   group: '@my-org/my-package',
 *   questions: async (ctx) => ({ label: await text({ message: 'Label?' }) }),
 *   generate: (answers, ctx) => [{ path: 'src/my-file.ts', content: '...' }],
 * } satisfies UmbracoExtensionGenerator;
 * ```
 */
export interface UmbracoExtensionGenerator {
  /**
   * Unique identifier matching the Umbraco manifest `type` field.
   * Used to deduplicate generators from multiple sources — last one registered wins.
   * @example "dashboard"
   * @example "entityAction"
   */
  type: string;

  /**
   * Display name shown in the interactive selection list.
   * @example "Dashboard"
   * @example "Entity Action"
   */
  name: string;

  /**
   * Short description shown as a hint in the selection list.
   * @example "A backoffice dashboard tab"
   */
  description: string;

  /**
   * Group header label shown in the fuzzy-select list to visually separate generators
   * from different sources. Built-in generators default to `"Umbraco CMS"`.
   * Third-party generators should use their package name.
   * @example "@umbraco-forms/backoffice"
   * @example "@umbraco-commerce/backoffice"
   */
  group?: string;

  /**
   * Collects type-specific answers from the user via `@clack/prompts`.
   * Called after the shared project-level prompts have been resolved.
   * The returned object is passed directly to `generate()` as `answers`.
   *
   * @param context - Resolved project-level context at the time of the prompt.
   */
  questions: (context: GeneratorContext) => Promise<Record<string, unknown>>;

  /**
   * Pure function that produces the files for this extension type.
   * Must have no side effects — all output is returned as `GeneratedFile[]`.
   * The CLI handles writing files, conflict detection, and `bundle.manifests.ts` patching.
   *
   * @param answers - The object returned by `questions()`.
   * @param context - Resolved project-level context.
   */
  generate: (answers: Record<string, unknown>, context: GeneratorContext) => Promise<GeneratedFile[]>;
}
