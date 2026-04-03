# create-umbraco-extension

A `npm init`-compatible CLI that scaffolds Umbraco backoffice extension projects and adds individual extensions to existing ones.

## What this project is

- **Package name**: `create-umbraco-extension` (enables `npm init umbraco-extension`)
- **Type**: Node.js CLI tool, ESM, compiled with `tsc`
- **Version**: Independent semver starting at `0.1.0`

## Toolchain

| Tool | Purpose |
|------|---------|
| `tsc` | Type checking + compilation to `dist/` |
| Vite 8 + rolldown | Bundling (replaces plain tsc output for the CLI) |
| oxlint | Linting |
| oxfmt | Formatting |
| vitest | Testing |

Scaffolded project templates also target Vite 8.

## Dev scripts

```bash
npm run build          # compile to dist/
npm run build:watch    # watch mode
npm run dev            # build + run interactive CLI
npm run lint           # oxlint
npm run format         # oxfmt
npm test               # vitest
npm run test:cli       # dry-run smoke test (--dry-run --json)
npm run test:cli:write # scaffold real project into /tmp/create-umb-test
```

## Code conventions

- **Exports**: Mixed — generators use `export default`, all other modules use named exports
- **JSDoc**: Required on public APIs only (`UmbracoExtensionGenerator`, `GeneratorContext`, `GeneratedFile`, exported utils). Skip on internal implementation code
- **Errors**: Friendly + actionable plain English — no raw stack traces shown to users
- **No over-engineering**: Only add abstractions the task actually requires. No speculative generics, no premature utilities

## Git workflow

- **Branches**: `feature/description` (e.g. `feature/core-types`)
- **PRs**: Required before merging to main — one PR per logical feature
- **Commits**: At logical milestones (module complete). Always confirm with Warren before committing
- **Never**: `git commit`, `git push`, or any destructive git operation without explicit go-ahead

## Working together

- **Stop and ask** before making any implementation decision, even minor ones
- **Flag concerns** proactively as they come up — don't save them for the end
- **Review checkpoints**: After each file, note briefly what it does. After each module, pause for Warren to review and test before moving on
- **Tests**: Written after all modules are complete — not alongside code
- **README**: Written at the end once the API is stable
- **CI/CD**: Added later — not now

## Things to avoid

- Over-engineering or speculative abstractions
- Touching code outside the current task scope (no surprise refactors)
- Any git operation without explicit confirmation
- ASCII art in the CLI banner
- Raw stack traces in user-facing error messages
