import { toPascalCase } from './strings.js';

/**
 * Normalises a user-supplied alias prefix to dot-separated PascalCase segments.
 * Handles spaces, hyphens, underscores, and mixed casing gracefully.
 *
 * @example normalisePrefix("My.Plugin")    // "My.Plugin"
 * @example normalisePrefix("my.plugin")    // "My.Plugin"
 * @example normalisePrefix("my plugin")    // "My.Plugin"
 * @example normalisePrefix("my-plugin")    // "My.Plugin"
 */
export function normalisePrefix(input: string): string {
  return input
    .split('.')
    .map(segment => toPascalCase(segment))
    .filter(Boolean)
    .join('.');
}

/**
 * Builds a fully-qualified Umbraco extension alias in the format:
 * `{NormalisedPrefix}.{TypeSegment}.{NameSegment}`
 *
 * @param prefix - The project alias prefix supplied by the user (e.g. "My.Plugin").
 * @param type   - The generator type string (e.g. "dashboard", "entityAction").
 * @param name   - The extension name supplied by the user (e.g. "My Dashboard").
 *
 * @example toUmbracoAlias("My.Plugin", "dashboard", "My Dashboard")
 * // "My.Plugin.Dashboard.MyDashboard"
 *
 * @example toUmbracoAlias("My.Plugin", "entityAction", "Delete Page")
 * // "My.Plugin.EntityAction.DeletePage"
 *
 * @example toUmbracoAlias("my plugin", "propertyEditorUi", "Rich Text")
 * // "My.Plugin.PropertyEditorUi.RichText"
 */
export function toUmbracoAlias(prefix: string, type: string, name: string): string {
  const normalisedPrefix = normalisePrefix(prefix);
  const typeSegment = toPascalCase(type);
  const nameSegment = toPascalCase(name);
  return `${normalisedPrefix}.${typeSegment}.${nameSegment}`;
}
