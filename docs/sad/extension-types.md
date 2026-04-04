# Extension Types

The Umbraco backoffice has 48 active extension types (2 deprecated). All non-deprecated types are supported, split into three groups based on how commonly developers scaffold them.

## Group A — Most common (full questions + rich example)

Shown in the interactive grouped selection list. Full type-specific prompts and a `withExample` mode that generates a richer, commented starting point.

| Type | Manifest interface | Notes |
|------|-------------------|-------|
| `dashboard` | `ManifestDashboard` | Section condition question |
| `section` | `ManifestSection` | label + pathname questions |
| `entityAction` | `ManifestEntityAction` | forEntityTypes, permission condition |
| `entityBulkAction` | `ManifestEntityBulkAction` | forEntityTypes, icon, label |
| `entityCreateOptionAction` | `ManifestEntityCreateOptionAction` | forEntityTypes, icon, label, description |
| `propertyEditorUi` | `ManifestPropertyEditorUi` | group, schema alias |
| `propertyEditorSchema` | `ManifestPropertyEditorSchema` | defaultPropertyEditorUiAlias |
| `workspaceView` | `ManifestWorkspaceView` | target workspace, pathname |
| `workspaceInfoApp` | `ManifestWorkspaceInfoApp` | target workspace |
| `workspace` | `ManifestWorkspace` | entityType |
| `tree` | `ManifestTree` | repositoryAlias (auto-generates repository too) |
| `treeItem` | `ManifestTreeItem` | forEntityTypes |
| `collection` | `ManifestCollection` | repositoryAlias, generate views? |
| `collectionView` | `ManifestCollectionView` | label, icon, pathName |
| `collectionAction` | `ManifestCollectionAction` | label, icon |
| `modal` | `ManifestModal` | modal token + element |
| `menuItem` | `ManifestMenuItem` | kind (action/link/tree), target menu |
| `menu` | `ManifestMenu` | label |
| `headerApp` | `ManifestHeaderApp` | kind (button/default) |
| `backofficeEntryPoint` | `ManifestBackofficeEntryPoint` | Always generated in new projects |

## Type-specific questions

Each generator ends with **"Include a working example?"** asked individually per extension.

| Type | Type-specific questions | With example adds |
|------|------------------------|-------------------|
| Dashboard | Name → Section condition (Content/Media/Settings/Custom/None) | Renders a simple HTML card using `UmbElementMixin` |
| Section | Name | An example dashboard manifest registered under the section |
| Entity Action | Name → Entity types (multi-select) → Permission condition? | `execute()` body with a notification toast |
| Property Editor UI | Name → Group → Schema alias | `@property` binding, value get/set, `UmbFormControlMixin` |
| Menu Item | Name → Kind (action/link) → Target menu alias | `execute()` navigating to a route |
| Collection | Name → Include table view? → Include card view? | Column definitions, mock data source |
| Tree | Name → Entity types | Repository returning hardcoded tree nodes |
| Workspace View | Name → Target workspace | `<uui-box>` with placeholder content |
| Modal | Name | Token definition, confirm/cancel buttons |
| Condition | Name → Alias | `permitted$` observable based on context value |

## Group B — Common infrastructure (minimal questions)

Shown in the interactive list. Minimal prompts, no `withExample` mode — always generates a stub with `TODO` comments.

| Type | Notes |
|------|-------|
| `repository` | API only — alias, no questions beyond name |
| `store` | API only — simple observable store stub |
| `itemStore` | API only — item store stub |
| `globalContext` | API only — context token + class |
| `sectionSidebarApp` | element — target section |
| `sectionView` | element — target section, pathname |
| `propertyAction` | element — target property editor UIs |
| `propertyEditorDataSource` | API only — dataSourceType, label, icon |
| `searchProvider` | API only — `requestSearch()` stub |
| `searchResultItem` | element — search result display |
| `localization` | plain JS — culture code question |
| `icons` | plain JS — icon set registration |
| `theme` | plain CSS — theme variable stubs |
| `previewApp` | element — preview window provider |
| `authProvider` | element — forProviderName |
| `externalLoginProvider` | element — label, pathname |
| `mfaLoginProvider` | element — forProviderName |
| `collectionMenuItem` | element + API |
| `collectionTextFilter` | element |

## Group C — Advanced (CLI flag only)

**Not shown in the interactive list** — accessible via `--type` flag only (for AI agents / advanced users).

| Type | Notes |
|------|-------|
| `propertyContext` | API — forPropertyEditorUis |
| `propertyValuePreset` | API — value preset stub |
| `propertyValueResolver` | API — resolver stub |
| `propertyValueCloner` | API — cloner stub |
| `propertyValidationPathTranslator` | API — translator stub |
| `dataSourceDataMapping` | API — mapping config |
| `pickerSearchResultItem` | element + API |
| `entityItemRef` | element |
| `entityCollectionItemCard` | element |
| `entityCollectionItemRef` | element |
| `entitySign` | element |
| `globalSearch` | API |
| `sectionContext` | API |
| `sectionRoute` | element + API |
| `appEntryPoint` | plain JS module |

## Deprecated types (not generated)

| Deprecated | Use instead |
|-----------|-------------|
| `entryPoint` | `backofficeEntryPoint` |
| `treeStore` | `repository` |

If a user somehow requests a deprecated type, the CLI mentions the correct alternative.
