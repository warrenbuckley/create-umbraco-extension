import type { UmbracoExtensionGenerator, GeneratorContext } from '../../types.js';
import { toPascalCase, toKebabCase } from '../../utils/strings.js';
import { toUmbracoAlias } from '../../utils/alias.js';
import { loadTemplate, applyTemplate } from '../../utils/template.js';

const generator: UmbracoExtensionGenerator = {
  type: 'entityBulkAction',
  name: 'Entity Bulk Action',
  description: 'A toolbar action for operating on multiple selected entities',
  group: 'Umbraco CMS',

  async questions(_context: GeneratorContext) {
    return {};
  },

  async generate(_answers, context) {
    const { aliasPrefix, extensionName, withExample } = context;
    const kebabName = toKebabCase(extensionName);
    const pascalName = toPascalCase(extensionName);
    const alias = toUmbracoAlias(aliasPrefix, 'EntityBulkAction', pascalName);
    const className = `${toPascalCase(aliasPrefix.replace(/\./g, ' '))}${pascalName}BulkAction`;
    const dir = 'src/entity-bulk-actions';

    const [manifestTpl, actionTpl] = await Promise.all([
      loadTemplate('entity-bulk-action', 'manifest.ts', withExample),
      loadTemplate('entity-bulk-action', 'action.ts', withExample),
    ]);

    return [
      {
        path: `${dir}/${kebabName}.manifest.ts`,
        content: applyTemplate(manifestTpl, {
          ALIAS: alias,
          NAME: extensionName,
          KEBAB_NAME: kebabName,
        }),
      },
      {
        path: `${dir}/${kebabName}.action.ts`,
        content: applyTemplate(actionTpl, {
          CLASS_NAME: className,
          NAME: extensionName,
        }),
      },
    ];
  },
};

export default generator;
