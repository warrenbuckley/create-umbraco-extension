import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'dashboard',
    alias: '{{ALIAS}}',
    name: '{{NAME}}',
    element: () => import('./{{KEBAB_NAME}}.element'),
    meta: {
      label: '{{NAME}}',
      pathname: '{{KEBAB_NAME}}',
    },
  },
];
