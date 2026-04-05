import type { UmbracoExtensionGenerator, GeneratorContext } from '../types.js';
import { toPascalCase, toKebabCase } from '../utils/strings.js';
import { toUmbracoAlias } from '../utils/alias.js';
import { loadTemplate, applyTemplate } from '../utils/template.js';

const generator: UmbracoExtensionGenerator = {
  type: 'entityCreateOptionAction',
  name: 'Entity Create Option Action',
  description: 'An option shown in the create dialog for an entity type',
  group: 'Umbraco CMS',

  async questions(_context: GeneratorContext) {
    return {};
  },

  async generate(_answers, context) {
    const { aliasPrefix, extensionName, withExample } = context;
    const kebabName = toKebabCase(extensionName);
    const pascalName = toPascalCase(extensionName);
    const alias = toUmbracoAlias(aliasPrefix, 'EntityCreateOptionAction', pascalName);
    const className = `${toPascalCase(aliasPrefix.replace(/\./g, ' '))}${pascalName}CreateOptionAction`;
    const dir = `src/entity-create-option-actions/${kebabName}`;

    const [manifestTpl, actionTpl] = await Promise.all([
      loadTemplate('entity-create-option-action/manifest.ts', withExample),
      loadTemplate('entity-create-option-action/action.ts', withExample),
    ]);

    return [
      {
        path: `${dir}/manifest.ts`,
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
