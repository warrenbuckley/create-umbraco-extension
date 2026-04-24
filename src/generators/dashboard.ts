import { text, confirm, multiselect, isCancel } from '@clack/prompts';
import type { UmbracoExtensionGenerator, GeneratorContext } from '../types.js';
import { toPascalCase, toKebabCase } from '../utils/strings.js';
import { toUmbracoAlias } from '../utils/alias.js';
import { loadTemplate, applyTemplate } from '../utils/template.js';

const UMBRACO_SECTIONS = [
  { value: 'Umb.Section.Content',  label: 'Content' },
  { value: 'Umb.Section.Media',    label: 'Media' },
  { value: 'Umb.Section.Settings', label: 'Settings' },
  { value: 'Umb.Section.Users',    label: 'Users' },
  { value: 'Umb.Section.Members',  label: 'Members' },
];

const generator: UmbracoExtensionGenerator = {
  type: 'dashboard',
  name: 'Dashboard',
  description: 'A backoffice dashboard tab shown in a section',
  group: 'Umbraco CMS',

  async questions(_context: GeneratorContext) {
    const label = await text({ message: 'Dashboard label/title?' });
    if (isCancel(label)) return null;

    const path = await text({ message: 'Dashboard URL path?', placeholder: 'my-dashboard' });
    if (isCancel(path)) return null;

    const weightRaw = await text({
      message: 'Weight (number)?',
      placeholder: '100',
      validate: (v) => (!v || v.trim() === '' || isNaN(Number(v)) ? 'Weight must be a valid number' : undefined),
    });
    if (isCancel(weightRaw)) return null;

    const limitToSections = await confirm({ message: 'Limit this dashboard to certain sections only?' });
    if (isCancel(limitToSections)) return null;

    let sections: string[] = [];
    if (limitToSections) {
      const picked = await multiselect({
        message: 'Which sections?',
        options: UMBRACO_SECTIONS,
      });
      if (isCancel(picked)) return null;
      sections = picked as string[];
    }

    return { label, path, weight: Number(weightRaw), sections };
  },

  async generate(answers, context) {
    const { aliasPrefix, extensionName, withExample } = context;
    const label = (answers.label as string) || extensionName;
    const pathname = (answers.path as string) || toKebabCase(extensionName);
    const weight = String(answers.weight as number);
    const sections = (answers.sections as string[]) ?? [];

    const kebabName = toKebabCase(extensionName);
    const pascalName = toPascalCase(extensionName);
    const alias = toUmbracoAlias(aliasPrefix, 'Dashboard', pascalName);
    const tagPrefix = aliasPrefix.replace(/\./g, '-').toLowerCase();
    const tagName = `${tagPrefix}-${kebabName}`;
    const className = `${toPascalCase(aliasPrefix.replace(/\./g, ' '))}${pascalName}Element`;
    const dir = 'src/dashboards';

    const conditionsBlock = sections.length > 0
      ? `\n    conditions: [\n      {\n        alias: 'Umb.Condition.SectionAlias',\n        oneOf: [${sections.map((s) => `'${s}'`).join(', ')}],\n      },\n    ],`
      : '';

    const [manifestTpl, elementTpl] = await Promise.all([
      loadTemplate('dashboard/manifest.ts', withExample),
      loadTemplate('dashboard/element.ts', withExample),
    ]);

    return [
      {
        path: `${dir}/${kebabName}.manifest.ts`,
        content: applyTemplate(manifestTpl, {
          ALIAS: alias,
          NAME: extensionName,
          KEBAB_NAME: kebabName,
          LABEL: label,
          PATHNAME: pathname,
          WEIGHT: weight,
          CONDITIONS: conditionsBlock,
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
