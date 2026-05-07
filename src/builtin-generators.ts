import type { UmbracoExtensionGenerator } from './types.js';
import dashboard from './templates/dashboard/generator.js';
import section from './templates/section/generator.js';
import entityAction from './templates/entity-action/generator.js';
import entityBulkAction from './templates/entity-bulk-action/generator.js';
import entityCreateOptionAction from './templates/entity-create-option-action/generator.js';

// Batch 2–4 generators (propertyEditorUi, workspace, tree, modal, etc.) are added here
// once implemented. Discovery via npm keywords and umbracoGenerator field supplements these.
export const builtInGenerators: UmbracoExtensionGenerator[] = [
  dashboard,
  section,
  entityAction,
  entityBulkAction,
  entityCreateOptionAction,
];
