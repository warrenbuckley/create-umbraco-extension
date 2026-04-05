import type { UmbracoExtensionGenerator, GeneratorContext } from '../types.js';
import { toPascalCase, toKebabCase } from '../utils/strings.js';
import { toUmbracoAlias } from '../utils/alias.js';
import { loadTemplate, applyTemplate } from '../utils/template.js';

const generator: UmbracoExtensionGenerator = {
  type: 'dashboard',
  name: 'Dashboard',
  description: 'A backoffice dashboard tab shown in a section',
  group: 'Umbraco CMS',

  async questions(_context: GeneratorContext) {
    return {};
  },

  async generate(_answers, context) {
    const { aliasPrefix, extensionName, withExample } = context;
    const kebabName = toKebabCase(extensionName);
    const pascalName = toPascalCase(extensionName);
    const alias = toUmbracoAlias(aliasPrefix, 'Dashboard', pascalName);
    const tagPrefix = aliasPrefix.replace(/\./g, '-').toLowerCase();
    const tagName = `${tagPrefix}-${kebabName}`;
    const className = `${toPascalCase(aliasPrefix.replace(/\./g, ' '))}${pascalName}Element`;
    const dir = `src/dashboards/${kebabName}`;

    const [manifestTpl, elementTpl] = await Promise.all([
      loadTemplate('dashboard/manifest.ts', withExample),
      loadTemplate('dashboard/element.ts', withExample),
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
        path: `${dir}/${kebabName}.element.ts`,
        content: applyTemplate(elementTpl, {
          TAG_NAME: tagName,
          CLASS_NAME: className,
          NAME: extensionName,
        }),
      },
    ];
  },
};

export default generator;
