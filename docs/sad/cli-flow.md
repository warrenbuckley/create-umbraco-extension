# CLI Flow

## Welcome banner

At startup, before any prompts, the CLI displays a randomly selected tagline from `src/taglines.ts`:

```
┌  create-umbraco-extension v0.1.0
│  Because nobody enjoys writing manifests from scratch.
```

Version is read from the CLI's own `package.json` at runtime. No ASCII art.

## Mode 1 — New project

Triggered when no `@umbraco-cms/backoffice` dependency is found in the cwd `package.json` (see `src/detect.ts`).

```
┌  create-umbraco-extension v0.1.0
│  Because life's too short to write vite.config.ts by hand.
│
◆  Target Umbraco version?
│  ● 17 — latest
│  ○ 16
│  ○ 15
│  ○ Specify a version...
│
◆  Project name?
│  my-dashboard-plugin
│
◆  Extension alias prefix? (used to namespace all extensions)
│  My.Plugin
│
◆  What extension would you like to add first?
│  [fuzzy-filter grouped list — see extension-types.md]
│
◆  [type-specific questions]
│
◆  Include a working example?
│  ● Yes — richer commented starting point
│  ○ No  — bare minimum files only
│
└─ Scaffolding in ./my-dashboard-plugin...
   ✓ Created package.json
   ✓ Created tsconfig.json
   ✓ Created vite.config.ts
   ✓ Created public/umbraco-package.json
   ✓ Created src/bundle.manifests.ts
   ✓ Created .claude/CLAUDE.md
   ✓ Created src/dashboards/my-dashboard.manifest.ts
   ✓ Created src/dashboards/my-dashboard.element.ts
│
◆  Add another extension?
│  ● Yes
│  ○ No
│
└─ Done! Next steps:
     cd my-dashboard-plugin
     npm install
     npm run build
```

## Mode 2 — Existing project

Triggered when `@umbraco-cms/backoffice` is found in the cwd `package.json`.

```
┌  create-umbraco-extension v0.1.0
│  Stop copy-pasting manifests. Start shipping extensions.
│
◇  Existing project detected: my-dashboard-plugin
│
◆  What extension would you like to add?
│  [fuzzy-filter grouped list]
│
◆  [type-specific questions]
│
◆  Include a working example?
│
└─ Done!
   ✓ Created src/entity-actions/delete-action.manifest.ts
   ✓ Created src/entity-actions/delete-action.action.ts
   ✓ Updated src/bundle.manifests.ts
```

The `◇` (info symbol) shows the project name from `package.json` so the developer can confirm they're in the right directory.

## Non-empty cwd without detection

If no Umbraco project is detected but the cwd is non-empty, a warning is shown before proceeding as new project:

```
⚠  No Umbraco extension project detected here.
   A new project will be scaffolded in this directory.
```

## "Add another extension?" loop

After each extension is scaffolded, the CLI asks if the user wants to add another. Each extension gets its own `withExample` question — the user can choose differently for each one in the same session.

## Conflict handling

When a file the CLI would generate already exists:
- The user is prompted per-file: **overwrite / skip / abort**
- Choosing abort exits immediately, leaving already-written files in place
