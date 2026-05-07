import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolves to dist/templates/ at runtime — templates are copied there by the build script.
const templatesDir = join(dirname(fileURLToPath(import.meta.url)), '../templates');

/**
 * Reads a template file from the bundled templates directory.
 *
 * When `withExample` is `true`, first looks for an `example/` subfolder variant.
 * If no example variant exists the `scaffold/` base template is returned, so not
 * every type needs both files.
 *
 * @param type        - The extension type folder, e.g. `"dashboard"`.
 * @param filename    - The file within that folder, e.g. `"element.ts"`.
 * @param withExample - When `true`, prefer the `example/` subfolder variant if present.
 */
export async function loadTemplate(type: string, filename: string, withExample = false): Promise<string> {
  if (withExample) {
    try {
      return await readFile(join(templatesDir, type, 'example', filename), 'utf-8');
    } catch {
      // No example variant exists — fall back to scaffold
    }
  }
  return readFile(join(templatesDir, type, 'scaffold', filename), 'utf-8');
}

/**
 * Replaces all `{{TOKEN}}` placeholders in a template string with the provided values.
 * Tokens not present in the `tokens` map are left unchanged.
 *
 * @param template - The raw template string containing `{{TOKEN}}` placeholders.
 * @param tokens   - A map of token names to their replacement values.
 *
 * @example
 * applyTemplate('class {{CLASS_NAME}} {}', { CLASS_NAME: 'MyDashboardElement' })
 * // → 'class MyDashboardElement {}'
 */
export function applyTemplate(template: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce(
    (content, [key, value]) => content.replaceAll(`{{${key}}}`, value),
    template,
  );
}
