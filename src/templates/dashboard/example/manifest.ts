import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'dashboard',
    alias: '{{ALIAS}}',
    name: '{{NAME}}',
    element: () => import('./{{KEBAB_NAME}}.element.js'),
    meta: {
      label: '{{NAME}}',
      pathname: '{{KEBAB_NAME}}',
    },
    conditions: [
      {
        alias: 'Umb.Condition.SectionAlias',
        match: 'Umb.Section.Content', // TODO: change to your target section alias
      },
    ],
  },
];
