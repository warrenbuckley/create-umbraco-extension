// @ts-nocheck
import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

/**
 * Bundle manifest — the single entry point Umbraco loads from umbraco-package.json.
 *
 * All extension manifests must be imported and spread into this array so Umbraco
 * can discover them at runtime.
 *
 * @see https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/bundle
 */
export const manifests: UmbExtensionManifest[] = [];
