import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'entityCreateOptionAction',
    alias: '{{ALIAS}}',
    name: '{{NAME}}',
    weight: 100,
    api: () => import('./{{KEBAB_NAME}}.action'),
    forEntityTypes: [], // TODO: add entity types, e.g. ['document']
    meta: {
      icon: 'icon-add',
      label: '{{NAME}}',
      additionalOptions: false,
    },
  },
];
