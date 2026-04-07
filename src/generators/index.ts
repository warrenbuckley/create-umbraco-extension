import type { UmbracoExtensionGenerator } from '../types.js';
import dashboard from './dashboard.js';
import section from './section.js';
import entityAction from './entity-action.js';
import entityBulkAction from './entity-bulk-action.js';
import entityCreateOptionAction from './entity-create-option-action.js';

// Batch 2–4 generators (propertyEditorUi, workspace, tree, modal, etc.) are added here
// once implemented. Discovery via npm keywords and umbracoGenerator field supplements these.
export const builtInGenerators: UmbracoExtensionGenerator[] = [
  dashboard,
  section,
  entityAction,
  entityBulkAction,
  entityCreateOptionAction,
];
