/**
 * Splits any string format (spaced, hyphenated, underscored, camelCase, PascalCase)
 * into an array of lowercase words. Used internally by all case-conversion functions.
 *
 * @example toWords("My Dashboard")   // ["my", "dashboard"]
 * @example toWords("myDashboard")    // ["my", "dashboard"]
 * @example toWords("my-dashboard")   // ["my", "dashboard"]
 * @example toWords("my_dashboard")   // ["my", "dashboard"]
 */
function toWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase / PascalCase → spaced
    .replace(/[-_]+/g, ' ')               // hyphens / underscores → spaces
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Converts a string to PascalCase.
 * Used for class names and alias segments in generated files.
 *
 * @example toPascalCase("my dashboard")  // "MyDashboard"
 * @example toPascalCase("entity-action") // "EntityAction"
 * @example toPascalCase("myPlugin")      // "MyPlugin"
 */
export function toPascalCase(input: string): string {
  return toWords(input)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Converts a string to camelCase.
 * Used for variable names in generated files.
 *
 * @example toCamelCase("my dashboard")  // "myDashboard"
 * @example toCamelCase("entity-action") // "entityAction"
 * @example toCamelCase("MyPlugin")      // "myPlugin"
 */
export function toCamelCase(input: string): string {
  const pascal = toPascalCase(input);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a string to kebab-case.
 * Used for HTML element tag names and file names in generated files.
 *
 * @example toKebabCase("my dashboard")  // "my-dashboard"
 * @example toKebabCase("EntityAction")  // "entity-action"
 * @example toKebabCase("myPlugin")      // "my-plugin"
 */
export function toKebabCase(input: string): string {
  return toWords(input).join('-');
}
