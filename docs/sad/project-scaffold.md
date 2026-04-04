# Project Scaffold Templates

When running in new-project mode, the CLI generates a complete Umbraco backoffice extension project. All templates are self-contained TypeScript template-string functions inside `src/generators/project.ts` — no dependency on the Umbraco CMS repository's own template files.

## Generated file structure

```
my-plugin/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── umbraco-package.json
└── src/
    ├── bundle.manifests.ts
    ├── entrypoints/
    │   ├── manifest.ts
    │   └── entrypoint.ts
    └── extensions/
        └── {first-extension}/
            ├── manifests.ts
            └── {extension}.element.ts
```

## File purposes

| File | Purpose |
|------|---------|
| `package.json` | `@umbraco-cms/backoffice` devDep at chosen version, `build`/`watch` scripts |
| `tsconfig.json` | Strict TS, `experimentalDecorators`, `@umbraco-cms/backoffice/extension-types` |
| `vite.config.ts` | ESM lib build, externalises `@umbraco*`, outputs to `wwwroot/App_Plugins/{Name}` |
| `public/umbraco-package.json` | Bundle registration pointing to compiled JS |
| `src/bundle.manifests.ts` | Entry point that spreads all extension manifests |
| `src/entrypoints/manifest.ts` | `backofficeEntryPoint` manifest |
| `src/entrypoints/entrypoint.ts` | `onInit` / `onUnload` lifecycle hooks |

## Scaffolded project toolchain (Vite 8)

Scaffolded projects target **Vite 8** which uses rolldown as its default bundler. The generated `vite.config.ts` uses Vite 8 conventions.

The Umbraco version chosen at the version prompt determines:
- `@umbraco-cms/backoffice` version in `package.json` devDependencies
- `vite.config.ts` output path: `App_Plugins/{ProjectName}`

## Keeping templates in sync

Templates are reproduced manually and kept in sync with Umbraco releases. When `@umbraco-cms/backoffice` starts shipping its own generators (Phase 2), the built-in templates become fallbacks and the live generators from the installed package take precedence automatically.
