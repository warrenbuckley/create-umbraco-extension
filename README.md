# create-umbraco-extension

An interactive CLI for scaffolding [Umbraco](https://umbraco.com) backoffice extension projects and adding individual extensions to existing ones.

```sh
npm init umbraco-extension
```

---

## Requirements

- Node.js ≥ 20.19.0
- npm, pnpm, yarn, or bun

---

## Usage

### Start a new project

Run from any empty directory — the CLI will create a project subdirectory for you:

```sh
npm init umbraco-extension
# or
npx create-umbraco-extension
# or
pnpm dlx create-umbraco-extension
```

The interactive flow will ask for:

1. **Project name** — used as the output directory name and in Vite's build config
2. **Alias prefix** — dot-separated PascalCase namespace (e.g. `My.Plugin`), auto-derived from the project name
3. **Umbraco version** — fetched live from npm; defaults to the last 3 major releases
4. Extension selection loop — add as many extensions as you like in one session
5. Optional dependency install with the detected package manager

### Add an extension to an existing project

Run from inside an existing Umbraco backoffice project (one that has `@umbraco-cms/backoffice` in its `package.json`):

```sh
npm init umbraco-extension
```

The CLI detects the existing project automatically and jumps straight to extension type selection. The alias prefix is read from `public/umbraco-package.json` so you don't need to type it again.

---

## What gets generated

### New project scaffold

| File | Purpose |
|------|---------|
| `package.json` | Private package with Vite build scripts and `@umbraco-cms/backoffice` dev dependency |
| `tsconfig.json` | TypeScript config targeting Vite's bundler module resolution |
| `vite.config.ts` | Vite build config — outputs to `wwwroot/App_Plugins/<name>/` |
| `public/umbraco-package.json` | Umbraco package manifest registering the bundle extension |
| `src/bundle.manifests.ts` | Top-level manifest aggregator (auto-patched when adding extensions) |
| `.claude/CLAUDE.md` | Claude Code context — project conventions and CLI usage |

### Extension types

| Type | Files generated |
|------|----------------|
| **Dashboard** | `src/dashboards/<name>.manifest.ts`, `src/dashboards/<name>.element.ts` |
| **Section** | `src/sections/<name>.manifest.ts` |
| **Entity Action** | `src/entity-actions/<name>.manifest.ts`, `src/entity-actions/<name>.action.ts` |
| **Entity Bulk Action** | `src/entity-bulk-actions/<name>.manifest.ts`, `src/entity-bulk-actions/<name>.action.ts` |
| **Entity Create Option Action** | `src/entity-create-option-actions/<name>.manifest.ts`, `src/entity-create-option-actions/<name>.action.ts` |

When adding an extension, `src/bundle.manifests.ts` is automatically patched to import and register it.

### Example implementations

Each extension type has a minimal scaffold (default) and a richer working example. The example variant includes realistic code such as notification feedback, context consumption, and state management. Choose it when you want a working starting point rather than a blank template.

---

## Non-interactive mode

When `--type`, `--name`, and `--prefix` are all provided, the CLI skips all prompts. Useful for CI pipelines, scripts, and AI coding assistants.

```sh
npx create-umbraco-extension \
  --type dashboard \
  --name "My Dashboard" \
  --prefix My.Plugin \
  --umbraco-version 17 \
  --example \
  --dry-run \
  --json
```

### Flags

| Flag | Description |
|------|-------------|
| `--type` | Extension type (e.g. `dashboard`, `entityAction`, `section`) |
| `--name` | Human-readable extension name (e.g. `"My Dashboard"`) |
| `--prefix` | Dot-separated alias namespace (e.g. `My.Plugin`) |
| `--umbraco-version` | Umbraco major version number (e.g. `17`) |
| `--example` | Include a working example implementation |
| `--dry-run` | Preview what would be written without touching the filesystem |
| `--json` | Output machine-readable JSON (implies non-interactive) |
| `--cwd` | Working directory (defaults to `process.cwd()`) |
| `--help`, `-h` | Print usage information and exit |

### JSON output

`--json` outputs a structured result to stdout:

```json
{
  "mode": "add",
  "type": "dashboard",
  "projectName": "my-plugin",
  "dryRun": false,
  "generated": [
    { "path": "src/dashboards/my-dashboard.manifest.ts", "status": "created" },
    { "path": "src/dashboards/my-dashboard.element.ts", "status": "created" }
  ],
  "bundlePatched": true
}
```

---

## Plugin system

Third-party packages can provide their own generator types. The CLI discovers them automatically from `node_modules` using three mechanisms, in priority order:

### 1. Config file (highest priority)

Create `.create-umbraco-extension.config.js` in your project root:

```js
export default {
  generators: [
    'my-custom-generators-package',
    './local/my-generator.js',
  ],
};
```

### 2. Package field

Add a `umbracoGenerator` field to your package's `package.json` pointing to the generator export:

```json
{
  "umbracoGenerator": "./dist/generator.js"
}
```

### 3. npm keyword (lowest priority)

Add `umbraco-extension-generator` to the `keywords` array in your package's `package.json`. The CLI scans `node_modules` and loads the package's `main` entry automatically.

### Writing a generator

A generator is an object implementing `UmbracoExtensionGenerator`:

```ts
import type { UmbracoExtensionGenerator } from 'create-umbraco-extension/types';

const generator: UmbracoExtensionGenerator = {
  type: 'myCustomType',
  name: 'My Custom Type',
  description: 'A short description shown in the selection list',
  group: 'My Package',   // optional — groups related types together

  async questions(context) {
    // Return additional answers needed by generate().
    // Use @clack/prompts here if you need interactive input.
    return {};
  },

  async generate(answers, context) {
    const { aliasPrefix, extensionName, outputDir, withExample } = context;
    return [
      {
        path: `src/my-type/${extensionName}/manifest.ts`,
        content: `// generated content`,
      },
    ];
  },
};

export default generator;
// or export default [generator1, generator2] for multiple types
```

#### `GeneratorContext`

| Property | Type | Description |
|----------|------|-------------|
| `projectName` | `string` | Kebab-case project name |
| `aliasPrefix` | `string` | Dot-separated alias namespace (e.g. `My.Plugin`) |
| `extensionName` | `string` | Human-readable extension name as entered |
| `outputDir` | `string` | Absolute path to write files into |
| `withExample` | `boolean` | Whether the user requested a working example |

---

## Building the generated project

The generated project uses [Vite](https://vite.dev) and outputs static assets to `wwwroot/App_Plugins/<name>/`. These assets are intended to be shipped inside a Razor Class Library as part of a NuGet package — the npm package itself is never published.

```sh
cd my-plugin
npm install
npm run build   # outputs to wwwroot/App_Plugins/my-plugin/
npm run watch   # watch mode
```

---

## License

MIT
