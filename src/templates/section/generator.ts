import { text, isCancel } from '@clack/prompts';
import type { UmbracoExtensionGenerator, GeneratorContext } from '../../types.js';
import { toPascalCase, toKebabCase } from '../../utils/strings.js';
import { toUmbracoAlias } from '../../utils/alias.js';
import { loadTemplate, applyTemplate } from '../../utils/template.js';

const generator: UmbracoExtensionGenerator = {
  type: 'section',
  name: 'Section',
  description: 'A top-level navigation section in the backoffice',
  group: 'Umbraco CMS',

  async questions(context: GeneratorContext) {
    const label = await text({ message: 'Section label (shown in backoffice nav)?' });
    if (isCancel(label)) return null;

    const pathname = await text({
      message: 'Section pathname (URL path segment)?',
      placeholder: toKebabCase(context.extensionName),
    });
    if (isCancel(pathname)) return null;

    const weightRaw = await text({
      message: 'Weight (ordering position)?',
      placeholder: '200',
      validate: (v) => (!v || v.trim() === '' || isNaN(Number(v)) ? 'Weight must be a valid number' : undefined),
    });
    if (isCancel(weightRaw)) return null;

    return { label, pathname, weight: Number(weightRaw) };
  },

  async generate(answers, context) {
    const { aliasPrefix, extensionName, withExample } = context;
    const label = (answers.label as string) || extensionName;
    const pathname = (answers.pathname as string) || toKebabCase(extensionName);
    const weight = String((answers.weight as number) || 200);

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
          LABEL: label,
          PATHNAME: pathname,
          WEIGHT: weight,
        }),
      },
    ];
  },
};

export default generator;
