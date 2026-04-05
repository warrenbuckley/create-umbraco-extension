import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';
import { manifests as entrypoints } from './entrypoints/manifest.js';

export const manifests: UmbExtensionManifest[] = [
  ...entrypoints,
];
