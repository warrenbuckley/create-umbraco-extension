import type { UmbracoExtensionGenerator, GeneratorContext } from '../types.js';
import { toPascalCase, toKebabCase } from '../utils/strings.js';
import { toUmbracoAlias } from '../utils/alias.js';
import { loadTemplate, applyTemplate } from '../utils/template.js';

const generator: UmbracoExtensionGenerator = {
  type: 'section',
  name: 'Section',
  description: 'A top-level navigation section in the backoffice',
  group: 'Umbraco CMS',

  async questions(_context: GeneratorContext) {
    return {};
  },

  async generate(_answers, context) {
    const { aliasPrefix, extensionName, withExample } = context;
    const kebabName = toKebabCase(extensionName);
    const pascalName = toPascalCase(extensionName);
    const alias = toUmbracoAlias(aliasPrefix, 'Section', pascalName);

    const manifestTpl = await loadTemplate('section', 'manifest.ts', withExample);

    return [
      {
        path: `src/sections/${kebabName}.manifest.ts`,
        content: applyTemplate(manifestTpl, {
          ALIAS: alias,
          NAME: extensionName,
          KEBAB_NAME: kebabName,
        }),
      },
    ];
  },
};

export default generator;
