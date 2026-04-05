import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'entityAction',
    alias: '{{ALIAS}}',
    name: '{{NAME}}',
    weight: 100,
    api: () => import('./{{KEBAB_NAME}}.action.js'),
    forEntityTypes: ['document'], // TODO: change to your target entity types
    meta: {
      icon: 'icon-box',
      label: '{{NAME}}',
    },
  },
];
