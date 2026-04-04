# Development Workflow & Testing

## Toolchain

| Tool | Version | Purpose |
|------|---------|---------|
| `tsc` | `^5.7.3` | Compile TypeScript → JavaScript (no bundler) |
| `oxlint` | `^1.58.0` | Linting |
| `vitest` | `^4.1.2` | Testing |
| oxfmt | deferred | Formatting — waiting for 1.0 stable release |

Scaffolded project templates target **Vite 8** (which uses rolldown). The CLI itself is built with plain `tsc`.

Node.js **20.19+** or **22.12+** required.

## Scripts

```bash
npm run build          # tsc — compile src/ → dist/
npm run build:watch    # tsc --watch
npm run dev            # build + run interactive CLI
npm run lint           # oxlint src/
npm run test           # vitest run
npm run test:watch     # vitest (watch mode)
npm run test:cli       # dry-run smoke test — prints JSON, writes no files
npm run test:cli:write # scaffold real project into /tmp/create-umb-test
```

## VSCode integration

- **Tasks** (`Cmd+Shift+P → Run Task`): build, build:watch, lint, test, test:watch, test:cli (dry run), dev
- **Default build task** (`Cmd+Shift+B`): `build`
- **Default test task**: `test`
- **Debug configs**: Debug CLI, Debug CLI (dry run), Debug Tests

## Fast dev iteration

```
Terminal 1: npm run build:watch   # recompiles on save
Terminal 2: npm run test:watch    # reruns tests on change
```

Or use the VSCode `build:watch` task (background, dedicated panel) alongside the Vitest Explorer extension for inline test results.

## Unit tests

Generator functions are **pure** — `generate(answers, context) → GeneratedFile[]` with no side effects. Test them without mocking:

```typescript
import { describe, it, expect } from 'vitest';
import dashboardGenerator from './dashboard.js';

describe('dashboard generator', () => {
  it('generates correct alias', () => {
    const files = dashboardGenerator.generate(
      { section: 'Umb.Section.Content' },
      { projectName: 'my-plugin', aliasPrefix: 'My.Plugin',
        extensionName: 'My Dashboard', outputDir: '/tmp', withExample: false }
    );
    const manifest = files.find(f => f.path.endsWith('manifests.ts'));
    expect(manifest?.content).toContain("alias: 'My.Plugin.Dashboard.MyDashboard'");
  });
});
```

## What to test

| Module | Focus |
|--------|-------|
| `generators/dashboard.ts` | Alias, tag name, class name, `withExample` branching |
| `generators/entity-action.ts` | Multi-entity-type output, permission condition |
| `generators/project.ts` | All required scaffold files present, version in package.json |
| `utils/strings.ts` | `toPascalCase`, `toKebabCase`, `toUmbracoAlias` edge cases |
| `utils/alias.ts` | Prefix normalisation, collision avoidance |
| `detect.ts` | Returns name when backoffice in deps; null otherwise |
| `discover.ts` | Keyword scan, `umbracoGenerator` field, config file loading |
| Bundle patch | Import inserted, spread added, idempotent if already present |

**Tests are written after all modules are complete** — not alongside implementation.

## End-to-end verification

1. `npm install && npm run build` — TypeScript compiles to `dist/`
2. `node dist/index.js` — welcome banner + interactive prompts appear
3. Scaffold a new dashboard project into `/tmp/umb-test` interactively
4. Verify generated file structure matches spec in `project-scaffold.md`
5. `cd /tmp/umb-test && npm install && npm run build` — Vite build succeeds
6. Re-run CLI inside `/tmp/umb-test` — detects existing project, skips setup
7. `npm test` — all unit tests pass
8. `npm run test:cli` — dry-run JSON contains expected file paths
9. Plugin discovery smoke test — install a local mock generator, verify it appears grouped in the selection list
