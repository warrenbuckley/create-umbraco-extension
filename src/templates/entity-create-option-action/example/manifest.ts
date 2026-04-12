import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'entityCreateOptionAction',
    alias: '{{ALIAS}}',
    name: '{{NAME}}',
    weight: 100,
    api: () => import('./{{KEBAB_NAME}}.action'),
    forEntityTypes: ['document'], // TODO: change to your target entity types
    meta: {
      icon: 'icon-add',
      label: '{{NAME}}',
      additionalOptions: false,
    },
  },
];
