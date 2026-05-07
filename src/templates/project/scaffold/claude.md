# {{DISPLAY_NAME}}

An Umbraco backoffice extension project scaffolded by [create-umbraco-extension](https://github.com/warrenbuckley/create-umbraco-extension).

## Project structure

```
public/
  umbraco-package.json       Umbraco package manifest — registers the bundle extension
src/
  bundle.manifests.ts        Top-level manifest array, auto-patched when extensions are added
  dashboards/                Dashboard extensions (one .manifest.ts + .element.ts per dashboard)
  sections/                  Section extensions
  entity-actions/            Entity action extensions
  entity-bulk-actions/       Entity bulk action extensions
  entity-create-option-actions/
```

## Key conventions

- **Alias prefix**: `{{ALIAS_PREFIX}}` — all extension aliases are prefixed with this
- **Bundle pattern**: `src/bundle.manifests.ts` is the single entry point Umbraco loads. Every extension manifest must be imported and spread into the `manifests` array there
- **File naming**: Extensions use a flat structure — `src/dashboards/my-dashboard.manifest.ts` and `src/dashboards/my-dashboard.element.ts`, not a subfolder per extension
- **Module resolution**: `moduleResolution: "bundler"` — no `.js` extensions needed on imports

## Adding more extensions

Use the CLI to scaffold additional extensions into this project. It will generate the files and automatically patch `src/bundle.manifests.ts`:

```bash
# Interactive
npm create umbraco-extension@alpha

# Non-interactive
npx create-umbraco-extension@alpha --type dashboard --name "My Dashboard" --prefix {{ALIAS_PREFIX}}
```

## Building

```bash
npm run build    # vite build → outputs to wwwroot/App_Plugins/{{PROJECT_NAME}}/
npm run watch    # watch mode
```

Place the built output in your Umbraco project's `wwwroot/App_Plugins/` folder.
