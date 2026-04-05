import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'section',
    alias: '{{ALIAS}}',
    name: '{{NAME}}',
    meta: {
      label: '{{NAME}}',
      pathname: '{{KEBAB_NAME}}',
    },
    conditions: [
      {
        alias: 'Umb.Condition.SectionUserPermission',
        match: '{{ALIAS}}',
      },
    ],
  },
];

// Remember to grant access to this section via Users → User Groups in the backoffice.
