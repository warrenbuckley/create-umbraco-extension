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
  },
];
