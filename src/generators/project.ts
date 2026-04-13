import type { GeneratedFile } from '../types.js';
import { loadTemplate, applyTemplate } from '../utils/template.js';

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
export async function generateProject(
  projectName: string,
  aliasPrefix: string,
  packageVersion: string,
): Promise<GeneratedFile[]> {
  const [viteConfig, bundleManifests, claudeMd] = await Promise.all([
    loadTemplate('project/vite.config.ts'),
    loadTemplate('project/bundle.manifests.ts'),
    loadTemplate('project/claude.md'),
  ]);

  const displayName = aliasPrefix.replace(/\./g, ' ');

  return [
    packageJson(packageVersion),
    tsconfig(),
    {
      path: 'vite.config.ts',
      content: applyTemplate(viteConfig, { PROJECT_NAME: projectName }),
    },
    umbracoPackageJson(projectName, aliasPrefix, displayName),
    {
      path: 'src/bundle.manifests.ts',
      content: bundleManifests,
    },
    {
      path: '.claude/CLAUDE.md',
      content: applyTemplate(claudeMd, {
        PROJECT_NAME: projectName,
        ALIAS_PREFIX: aliasPrefix,
        DISPLAY_NAME: displayName,
      }),
    },
  ];
}

// ─── JSON file generators (no templates needed) ───────────────────────────────

function packageJson(packageVersion: string): GeneratedFile {
  return {
    path: 'package.json',
    content: JSON.stringify(
      {
        private: true,
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
