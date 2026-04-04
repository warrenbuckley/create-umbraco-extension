# Solution Architecture Document — create-umbraco-extension

> **Internal document.** This SAD is for contributors and maintainers. For user-facing documentation see the public docs site (coming later via Astro).

## What this project is

`create-umbraco-extension` is an `npm init`-compatible CLI that scaffolds Umbraco backoffice extension projects and adds individual extensions to existing ones.

```bash
npm init umbraco-extension   # interactive mode
npx create-umbraco-extension # equivalent
```

Inspired by `create-vite`, it uses `@clack/prompts` for a modern interactive TUI and supports a plugin architecture so third-party package authors can contribute their own generators.

## Sub-documents

| Document | Contents |
|----------|----------|
| [architecture.md](./architecture.md) | Repo structure, core types, key design decisions |
| [cli-flow.md](./cli-flow.md) | Two modes (new project / existing), UX flows, welcome banner |
| [extension-types.md](./extension-types.md) | All 48 extension types, Groups A/B/C, type-specific questions |
| [generators.md](./generators.md) | Generator interface, plugin system, auto-discovery, self-updating |
| [project-scaffold.md](./project-scaffold.md) | New project template files (package.json, vite.config, etc.) |
| [bundle-patch.md](./bundle-patch.md) | bundle.manifests.ts patch logic |
| [non-interactive.md](./non-interactive.md) | CLI flags, --json, --dry-run, AI agent / skill.md |
| [development.md](./development.md) | Toolchain, scripts, testing strategy, verification steps |

## Key decisions

- **npm convention**: package named `create-umbraco-extension` enables `npm init umbraco-extension`
- **Versioning**: independent semver starting at `0.1.0` — decoupled from Umbraco CMS versions
- **Build**: plain `tsc` — no bundler needed for an npm-distributed Node.js CLI
- **Scaffolded projects**: target Vite 8 (rolldown bundler)
- **Plugin architecture**: three discovery mechanisms (config file, `umbracoGenerator` field, npm keyword)
- **Self-updating**: built-in generators are fallbacks; `@umbraco-cms/backoffice` can ship its own generators in future
- **No CI/CD on day one** — added once the project stabilises
- **No README on day one** — written once the API is stable
