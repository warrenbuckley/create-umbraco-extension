export const manifests: UmbExtensionManifest[] = [
  {
    type: 'section',
    alias: '{{ALIAS}}',
    name: '{{NAME}}',
    weight: {{WEIGHT}},
    meta: {
      label: '{{LABEL}}',
      pathname: '{{PATHNAME}}',
    },
  },
];

// Grant access to this section via Users → User Groups → Allowed sections in the backoffice.
