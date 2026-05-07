import { describe, it, expect } from 'vitest';
import { generateProject } from './generator.js';

const PROJECT_NAME = 'my-plugin';
const ALIAS_PREFIX = 'My.Plugin';
const VERSION = '^17.0.0';

// Lazily called so each test gets a fresh result without re-running the async call repeatedly.
async function files() {
  return generateProject(PROJECT_NAME, ALIAS_PREFIX, VERSION);
}

function find(result: Awaited<ReturnType<typeof files>>, path: string) {
  const file = result.find(f => f.path === path);
  expect(file, `expected file at path "${path}"`).toBeDefined();
  return file!;
}

describe('generateProject', () => {
  it('returns exactly 6 files', async () => {
    expect(await files()).toHaveLength(6);
  });

  it('includes all expected file paths', async () => {
    const paths = (await files()).map(f => f.path);
    expect(paths).toContain('package.json');
    expect(paths).toContain('tsconfig.json');
    expect(paths).toContain('vite.config.ts');
    expect(paths).toContain('public/umbraco-package.json');
    expect(paths).toContain('src/bundle.manifests.ts');
    expect(paths).toContain('.claude/CLAUDE.md');
  });

  it('package.json targets the requested backoffice version', async () => {
    const file = find(await files(), 'package.json');
    const pkg = JSON.parse(file.content);
    expect(pkg.devDependencies['@umbraco-cms/backoffice']).toBe(VERSION);
  });

  it('package.json has build and watch scripts', async () => {
    const file = find(await files(), 'package.json');
    const pkg = JSON.parse(file.content);
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.watch).toBeDefined();
  });

  it('tsconfig.json targets ES2022 and enables decorators', async () => {
    const file = find(await files(), 'tsconfig.json');
    const tsconfig = JSON.parse(file.content);
    expect(tsconfig.compilerOptions.target).toBe('ES2022');
    expect(tsconfig.compilerOptions.experimentalDecorators).toBe(true);
  });

  it('vite.config.ts contains the project name', async () => {
    const file = find(await files(), 'vite.config.ts');
    expect(file.content).toContain(PROJECT_NAME);
  });

  it('umbraco-package.json registers a bundle extension with the alias prefix', async () => {
    const file = find(await files(), 'public/umbraco-package.json');
    const pkg = JSON.parse(file.content);
    const bundle = pkg.extensions.find((e: { type: string }) => e.type === 'bundle');
    expect(bundle).toBeDefined();
    expect(bundle.alias).toContain(ALIAS_PREFIX);
  });

  it('.claude/CLAUDE.md contains the project name and alias prefix', async () => {
    const file = find(await files(), '.claude/CLAUDE.md');
    expect(file.content).toContain(PROJECT_NAME);
    expect(file.content).toContain(ALIAS_PREFIX);
  });

  it('leaves no unfilled tokens in templated files', async () => {
    const result = await files();
    const templated = ['vite.config.ts', '.claude/CLAUDE.md'];
    for (const path of templated) {
      const file = find(result, path);
      expect(file.content, `unfilled token in ${path}`).not.toMatch(/\{\{[A-Z_]+\}\}/);
    }
  });
});
