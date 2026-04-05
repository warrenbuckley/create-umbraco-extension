import type { GeneratedFile } from '../types.js';

/**
 * Generates the full file set for a new Umbraco backoffice extension project.
 *
 * This is intentionally not an `UmbracoExtensionGenerator` — project-level prompts
 * (name, alias prefix, version) are collected directly in `cli.ts` and passed here.
 *
 * @param projectName     - The npm package name, e.g. `"my-plugin"`.
 * @param aliasPrefix     - The dot-separated alias namespace, e.g. `"My.Plugin"`.
 * @param packageVersion  - The `@umbraco-cms/backoffice` semver range, e.g. `"^17.0.0"`.
 * @returns               - All scaffold files, paths relative to the project output dir.
 */
export function generateProject(
  projectName: string,
  aliasPrefix: string,
  packageVersion: string,
): GeneratedFile[] {
  // Derive display name from aliasPrefix: "My.Plugin" → "My Plugin"
  const displayName = aliasPrefix.replace(/\./g, ' ');

  return [
    packageJson(projectName, packageVersion),
    tsconfig(),
    viteConfig(projectName),
    umbracoPackageJson(projectName, aliasPrefix, displayName),
    bundleManifests(),
    entrypointManifest(aliasPrefix, displayName),
    entrypointElement(displayName),
  ];
}

// ─── File templates ───────────────────────────────────────────────────────────

function packageJson(projectName: string, packageVersion: string): GeneratedFile {
  return {
    path: 'package.json',
    content: JSON.stringify(
      {
        name: projectName,
        version: '0.1.0',
        type: 'module',
        scripts: {
          build: 'vite build',
          watch: 'vite build --watch',
        },
        devDependencies: {
          '@umbraco-cms/backoffice': packageVersion,
          typescript: '^5.7.3',
          vite: '^8.0.0',
        },
      },
      null,
      2,
    ) + '\n',
  };
}

function tsconfig(): GeneratedFile {
  return {
    path: 'tsconfig.json',
    content: JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: false,
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          experimentalDecorators: true,
          types: ['@umbraco-cms/backoffice/extension-types'],
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        },
        include: ['src'],
      },
      null,
      2,
    ) + '\n',
  };
}

function viteConfig(projectName: string): GeneratedFile {
  return {
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/bundle.manifests.ts',
      fileName: 'bundle.manifests',
      formats: ['es'],
    },
    outDir: 'wwwroot/App_Plugins/${projectName}',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
`,
  };
}

function umbracoPackageJson(
  projectName: string,
  aliasPrefix: string,
  displayName: string,
): GeneratedFile {
  return {
    path: 'public/umbraco-package.json',
    content: JSON.stringify(
      {
        $schema: '../../umbraco-package-schema.json',
        name: displayName,
        version: '0.1.0',
        extensions: [
          {
            type: 'bundle',
            alias: `${aliasPrefix}.Bundle`,
            name: `${displayName} Bundle`,
            js: `/App_Plugins/${projectName}/bundle.manifests.js`,
          },
        ],
      },
      null,
      2,
    ) + '\n',
  };
}

function bundleManifests(): GeneratedFile {
  return {
    path: 'src/bundle.manifests.ts',
    content: `import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';
import { manifests as entrypoints } from './entrypoints/manifest.js';

export const manifests: UmbExtensionManifest[] = [
  ...entrypoints,
];
`,
  };
}

function entrypointManifest(aliasPrefix: string, displayName: string): GeneratedFile {
  return {
    path: 'src/entrypoints/manifest.ts',
    content: `import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [
  {
    type: 'backofficeEntryPoint',
    alias: '${aliasPrefix}.EntryPoint',
    name: '${displayName} Entry Point',
    js: () => import('./entrypoint.js'),
  },
];
`,
  };
}

function entrypointElement(displayName: string): GeneratedFile {
  return {
    path: 'src/entrypoints/entrypoint.ts',
    content: `import type { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';

// ${displayName} entry point — runs once when the backoffice loads this package.
// Register contexts, import side-effectful modules, or set up global state here.
export const onInit: UmbEntryPointOnInit = (_host, _extensionRegistry) => {
  // TODO: initialise your extensions
};
`,
  };
}
