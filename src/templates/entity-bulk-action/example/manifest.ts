import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'entityBulkAction',
    alias: '{{ALIAS}}',
    name: '{{NAME}}',
    weight: 100,
    api: () => import('./{{KEBAB_NAME}}.action'),
    meta: {
      icon: 'icon-box',
      label: '{{NAME}}',
    },
    conditions: [
      {
        alias: 'Umb.Condition.CollectionAlias',
        match: 'Umb.Collection.Document', // TODO: change to your target collection alias
      },
    ],
  },
];
