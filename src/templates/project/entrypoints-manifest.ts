import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'backofficeEntryPoint',
    alias: '{{ALIAS_PREFIX}}.EntryPoint',
    name: '{{DISPLAY_NAME}} Entry Point',
    js: () => import('./entrypoint.js'),
  },
];
