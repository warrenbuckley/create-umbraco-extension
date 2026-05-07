# Generators & Plugin System

## The generator interface

Every built-in and third-party generator implements `UmbracoExtensionGenerator` from `src/types.ts`:

```typescript
export interface UmbracoExtensionGenerator {
  type: string;       // unique, matches Umbraco manifest type e.g. "dashboard"
  name: string;       // display name shown in the selection list
  description: string;
  group?: string;     // group header — defaults to "Umbraco CMS" for built-ins
  questions: (context: GeneratorContext) => Promise<Record<string, unknown>>;
  generate: (answers: Record<string, unknown>, context: GeneratorContext) => GeneratedFile[];
}
```

Generator functions are **pure** — `generate()` takes answers and context and returns files with no side effects. This makes them straightforward to test without mocking.

Built-in generators live at `src/templates/{type}/generator.ts` and use `export default` to mirror the third-party plugin API exactly.

## Plugin auto-discovery (`src/discover.ts`)

Three mechanisms are checked in order and merged. If two generators share the same `type`, the last one wins (higher priority overrides lower).

### Priority (highest → lowest)

1. **Config file** — `.create-umbraco-extension.config.js` in the cwd
2. **`umbracoGenerator` field** — on any installed package's `package.json`
3. **npm keyword scan** — packages with `"umbraco-extension-generator"` in `keywords`
4. **CLI built-ins** — fallback when none of the above apply

### 1. Config file

```js
// .create-umbraco-extension.config.js
export default {
  generators: [
    'my-block-editor-generators',  // npm package (already installed)
    './local-generators/widget.js', // local file path
  ]
};
```

Useful for monorepo scenarios or generators that aren't published to npm.

### 2. `umbracoGenerator` field

Any installed package can ship a generator alongside its source:

```json
// node_modules/@my-org/my-package/package.json
{
  "name": "@my-org/my-package",
  "umbracoGenerator": "./generator/index.js"
}
```

The CLI reads this field from every installed package in `node_modules`.

### 3. npm keyword scan

Any installed package with `"umbraco-extension-generator"` in its `keywords` is loaded automatically. Zero config for the consumer.

### Third-party generator example

```typescript
import type { UmbracoExtensionGenerator } from 'create-umbraco-extension/types';

export default {
  type: 'blockEditor.customView',
  name: 'Block Editor Custom View',
  description: 'A custom view for a block editor entry',
  group: '@my-org/my-package',
  questions: async (ctx) => { /* @clack/prompts calls */ },
  generate: (answers, ctx) => [/* GeneratedFile[] */],
} satisfies UmbracoExtensionGenerator;
```

Both a single `export default` and an array `export default [gen1, gen2]` are accepted.

## Self-updating via `@umbraco-cms/backoffice`

The same `umbracoGenerator` discovery mechanism applies to `@umbraco-cms/backoffice` itself. If the package ships a `"umbracoGenerator"` field, the CLI auto-discovers new extension types when the user updates their backoffice version — no CLI update required.

### Phased rollout

**Phase 1 (now):** CLI ships built-in generators for all known types. Works immediately.

**Phase 2 (future PR to Umbraco CMS):** `@umbraco-cms/backoffice` adds `"umbracoGenerator": "./generator/index.js"`. Built-in generators become dead fallbacks — live generators come from the installed package. New types added in future Umbraco versions auto-appear without a CLI update.

**Phase 3 (ecosystem):** Forms, Commerce, and community packages add `"umbracoGenerator"` to their own packages.

## Type selection

The extension type list uses `@clack/prompts` `select` directly — a plain scrollable list. Group C types are not shown — accessible via `--type` flag only.

A fuzzy-filter / live-search prompt is planned for a future iteration once real-world usage patterns are established (e.g. how often users scroll past many types, whether third-party plugin grouping is commonly needed). The `cli.ts` call site is the right place to introduce it when the time comes.

## Grouped selection with third-party generators

```
◆  What extension would you like to add?
│
│  ─── Umbraco CMS ──────────────────────
│  ○ Dashboard
│  ○ Entity Action  …
│
│  ─── @umbraco-forms/backoffice ────────
│  ● Forms Field Preview
│  ○ Forms Setting Value Converter
│
│  ─── @umbraco-commerce/backoffice ─────
│  ○ Analytics Widget
│  ○ Order Line Action
```

Groups are implemented as disabled separator options interspersed between real options in the `@clack/prompts` select list.
