import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { detectExistingProject, detectAliasPrefix } from './detect.js';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'umb-detect-test-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

// ─── helpers ─────────────────────────────────────────────────────────────────

async function writePackageJson(content: Record<string, unknown>) {
  await writeFile(join(dir, 'package.json'), JSON.stringify(content));
}

async function writeUmbracoPackageJson(extensions: unknown[]) {
  await mkdir(join(dir, 'public'), { recursive: true });
  await writeFile(
    join(dir, 'public', 'umbraco-package.json'),
    JSON.stringify({ extensions }),
  );
}

// ─── detectExistingProject ───────────────────────────────────────────────────

describe('detectExistingProject', () => {
  it('returns the project name when backoffice is in dependencies', async () => {
    await writePackageJson({
      name: 'my-plugin',
      dependencies: { '@umbraco-cms/backoffice': '^17.0.0' },
    });
    expect(await detectExistingProject(dir)).toBe('my-plugin');
  });

  it('returns the project name when backoffice is in devDependencies', async () => {
    await writePackageJson({
      name: 'my-plugin',
      devDependencies: { '@umbraco-cms/backoffice': '^17.0.0' },
    });
    expect(await detectExistingProject(dir)).toBe('my-plugin');
  });

  it('falls back to the directory basename when package.json has no name', async () => {
    await writePackageJson({
      devDependencies: { '@umbraco-cms/backoffice': '^17.0.0' },
    });
    expect(await detectExistingProject(dir)).toBe(basename(dir));
  });

  it('returns null when no package.json exists', async () => {
    expect(await detectExistingProject(dir)).toBeNull();
  });

  it('returns null when backoffice is absent from all deps', async () => {
    await writePackageJson({
      name: 'my-plugin',
      devDependencies: { vite: '^8.0.0' },
    });
    expect(await detectExistingProject(dir)).toBeNull();
  });
});

// ─── detectAliasPrefix ───────────────────────────────────────────────────────

describe('detectAliasPrefix', () => {
  it('extracts the prefix by stripping .Bundle from the bundle alias', async () => {
    await writeUmbracoPackageJson([
      { type: 'bundle', alias: 'My.Plugin.Bundle', name: 'My Plugin Bundle' },
    ]);
    expect(await detectAliasPrefix(dir)).toBe('My.Plugin');
  });

  it('returns undefined when no umbraco-package.json exists', async () => {
    expect(await detectAliasPrefix(dir)).toBeUndefined();
  });

  it('returns undefined when extensions array has no bundle type', async () => {
    await writeUmbracoPackageJson([
      { type: 'dashboard', alias: 'My.Plugin.Dashboard' },
    ]);
    expect(await detectAliasPrefix(dir)).toBeUndefined();
  });

  it('returns undefined when the bundle alias does not end in .Bundle', async () => {
    await writeUmbracoPackageJson([
      { type: 'bundle', alias: 'My.Plugin.Entry' },
    ]);
    expect(await detectAliasPrefix(dir)).toBeUndefined();
  });
});
