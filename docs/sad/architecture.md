# Architecture

## Repository structure

```
create-umbraco-extension/
├── .github/
│   └── pull_request_template.md
├── .vscode/
│   ├── extensions.json       # Recommended: oxc, vitest, errorlens
│   ├── settings.json         # oxlint enabled, ESLint disabled, dist excluded
│   ├── tasks.json            # build, lint, test, dev tasks
│   └── launch.json           # Debug CLI + Debug CLI (dry run) + Debug Tests
├── docs/
│   └── sad/                  # This Solution Architecture Document (not public)
├── src/
│   ├── index.ts              # #!/usr/bin/env node — entry point
│   ├── cli.ts                # Main orchestration: detect → version → ask → generate → loop
│   ├── detect.ts             # Detect existing Umbraco project in cwd
│   ├── discover.ts           # Plugin auto-discovery from node_modules
│   ├── versions.ts           # Fetch @umbraco-cms/backoffice dist-tags from npm
│   ├── taglines.ts           # Random tagline pool for the welcome banner
│   ├── types.ts              # Public interfaces (exported as ./types)
│   ├── generators/
│   │   ├── index.ts          # Aggregates all built-in generators
│   │   ├── project.ts        # New project scaffold
│   │   └── *.ts              # One file per Group A extension type
│   └── utils/
│       ├── write-files.ts    # File writing with per-file conflict prompt
│       ├── search-select.ts  # Fuzzy-filter prompt (@clack/core)
│       ├── strings.ts        # camelCase, PascalCase, kebab-case helpers
│       └── alias.ts          # Umbraco alias generation (My.Plugin.Dashboard)
├── skill.md                  # Claude Code / AI agent skill descriptor
├── CLAUDE.md                 # AI assistant working rules for this repo
├── CONTRIBUTING.md           # Contributor guide (added later)
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md                 # Written once API is stable
└── dist/                     # Compiled output (gitignored)
```

## Core types (`src/types.ts`)

These are the **public API** — exported via `./types` for third-party plugin authors.

```typescript
export interface GeneratedFile {
  path: string;     // relative to output dir
  content: string;
}

export interface GeneratorContext {
  projectName: string;    // e.g. "my-plugin"
  aliasPrefix: string;    // e.g. "My.Plugin"
  extensionName: string;  // e.g. "My Dashboard"
  outputDir: string;      // absolute path
  withExample: boolean;   // true = richer example, false = bare minimum
}

export interface UmbracoExtensionGenerator {
  type: string;           // unique, matches Umbraco manifest type
  name: string;           // display name, e.g. "Dashboard"
  description: string;    // shown in the fuzzy-select list
  group?: string;         // group header, defaults to "Umbraco CMS"
  questions: (context: GeneratorContext) => Promise<Record<string, unknown>>;
  generate: (answers: Record<string, unknown>, context: GeneratorContext) => GeneratedFile[];
}
```

## Export convention

- **Generators** (`src/generators/*.ts`): `export default` — mirrors the third-party plugin API
- **Everything else** (`src/utils/`, `src/detect.ts`, etc.): named exports

## Key design decisions

**Why `tsc` and not a bundler for the CLI?**
Node.js resolves `node_modules` at runtime, so bundling adds no value for an npm-distributed CLI. Plain `tsc` is simpler, zero config beyond `tsconfig.json`, and is how `create-vite` itself is built.

**Why `module: "NodeNext"` in tsconfig?**
`NodeNext` enforces ESM-correct import semantics — relative imports must include `.js` extensions (e.g. `./utils/strings.js`), which is what Node actually resolves at runtime. Paired with `"type": "module"` in `package.json` this gives fully correct ESM output.

**Why `@clack/prompts` and not Inquirer or Prompts?**
`@clack/prompts` has a distinctly modern aesthetic (box-drawing characters, consistent `◆/◇/●/○` symbols) that matches the quality bar of tools like `create-vite`. Inquirer is heavier and uses a different visual style.
