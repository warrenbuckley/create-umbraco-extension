# Non-Interactive Mode & AI Agent Support

## CLI flags

All prompts can be bypassed by supplying flags. Missing flags fall back to interactive prompts.

### Global flags

| Flag | Purpose |
|------|---------|
| `--name <name>` | Project or extension name |
| `--prefix <alias>` | Alias prefix (e.g. `My.Plugin`) |
| `--type <type>` | Extension type (e.g. `dashboard`, `entityAction`) |
| `--umbraco-version <ver>` | Target Umbraco version (new project only) |
| `--example` / `--no-example` | Include working example or minimal stub |
| `--cwd <path>` | Working directory (default: cwd) |
| `--json` | Output results as machine-readable JSON |
| `--dry-run` | Show what would be generated without writing files |

### Type-specific flags

| Flag | Suppresses |
|------|-----------|
| `--section <alias>` | Dashboard: section condition prompt |
| `--entity-types <a,b>` | EntityAction / Tree: entity types prompt |
| `--property-editor <alias>` | PropertyEditorUi: schema alias prompt |
| `--workspace <alias>` | WorkspaceView: target workspace prompt |
| `--menu <alias>` | MenuItem: target menu prompt |

### Usage modes

| Mode | How |
|------|-----|
| Fully interactive | `npm init umbraco-extension` — all prompts |
| Partially pre-filled | Mix of flags + prompts for missing values |
| Fully non-interactive | All required flags provided — no prompts |

### Examples

```bash
# New project — fully non-interactive
npx create-umbraco-extension \
  --name my-plugin \
  --prefix My.Plugin \
  --umbraco-version 17 \
  --type dashboard \
  --section Umb.Section.Content \
  --example

# Add to existing project — output JSON for scripting
npx create-umbraco-extension \
  --type entityAction \
  --prefix My.Plugin \
  --name "Delete Page" \
  --entity-types Umb.Entity.Key.Document \
  --no-example \
  --json
```

## JSON output (`--json`)

```json
{
  "created": [
    "src/extensions/delete-page/manifests.ts",
    "src/extensions/delete-page/delete-page.ts"
  ],
  "updated": ["src/bundle.manifests.ts"],
  "errors": []
}
```

## Dry-run (`--dry-run`)

Prints the same JSON as `--json` but writes no files. Useful for verifying generator output in CI or during development.

## Group C types (advanced)

Group C extension types are not shown in the interactive list to avoid overwhelming new users. They are accessible via `--type` flag only:

```bash
npx create-umbraco-extension --type propertyContext --prefix My.Plugin --name "My Context"
```

## Claude Code skill (`skill.md`)

A companion `skill.md` ships at the repo root. This teaches Claude Code (and other AI agents) how to use the tool with flags rather than interactive prompts.

When installed into a project's `.claude/skills/`, AI agents automatically know how to call `create-umbraco-extension` correctly.
