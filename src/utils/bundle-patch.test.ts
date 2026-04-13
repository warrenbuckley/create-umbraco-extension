import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { patchBundleManifests } from './bundle-patch.js';

const EMPTY_BUNDLE = `// @ts-nocheck
import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';

export const manifests: UmbExtensionManifest[] = [];
`;

const PATCHED_ONCE = `// @ts-nocheck
import type { UmbExtensionManifest } from '@umbraco-cms/backoffice/extension-api';
import { manifests as myDashboard } from './dashboards/my-dashboard.manifest.js';

export const manifests: UmbExtensionManifest[] = [
  ...myDashboard,
];
`;

let testDir: string;

beforeEach(async () => {
  testDir = join(tmpdir(), `bundle-patch-test-${Date.now()}`);
  await mkdir(join(testDir, 'src'), { recursive: true });
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('patchBundleManifests — dry run', () => {
  it('returns the computed importPath and alias without writing', async () => {
    const result = await patchBundleManifests(
      testDir,
      'src/dashboards/my-dashboard.manifest.ts',
      true,
    );
    expect(result.patched).toBe(false);
    expect(result.importPath).toBe('./dashboards/my-dashboard.manifest.js');
    expect(result.alias).toBe('myDashboard');
  });

  it('derives alias from multi-word kebab name', async () => {
    const result = await patchBundleManifests(
      testDir,
      'src/dashboards/cool-analytics-dashboard.manifest.ts',
      true,
    );
    expect(result.alias).toBe('coolAnalyticsDashboard');
    expect(result.importPath).toBe('./dashboards/cool-analytics-dashboard.manifest.js');
  });

  it('handles entity-action paths', async () => {
    const result = await patchBundleManifests(
      testDir,
      'src/entity-actions/delete-item.manifest.ts',
      true,
    );
    expect(result.alias).toBe('deleteItem');
    expect(result.importPath).toBe('./entity-actions/delete-item.manifest.js');
  });
});

describe('patchBundleManifests — file patching', () => {
  it('inserts import and spread into an empty bundle', async () => {
    await writeFile(join(testDir, 'src', 'bundle.manifests.ts'), EMPTY_BUNDLE, 'utf-8');

    const result = await patchBundleManifests(
      testDir,
      'src/dashboards/my-dashboard.manifest.ts',
      false,
    );

    expect(result.patched).toBe(true);
    const written = await readFile(join(testDir, 'src', 'bundle.manifests.ts'), 'utf-8');
    expect(written).toContain("import { manifests as myDashboard } from './dashboards/my-dashboard.manifest.js';");
    expect(written).toContain('...myDashboard,');
  });

  it('is idempotent — does not patch twice', async () => {
    await writeFile(join(testDir, 'src', 'bundle.manifests.ts'), PATCHED_ONCE, 'utf-8');

    const result = await patchBundleManifests(
      testDir,
      'src/dashboards/my-dashboard.manifest.ts',
      false,
    );

    expect(result.patched).toBe(false);
    const written = await readFile(join(testDir, 'src', 'bundle.manifests.ts'), 'utf-8');
    expect(written).toBe(PATCHED_ONCE);
  });

  it('returns patched:false silently when bundle.manifests.ts does not exist', async () => {
    const result = await patchBundleManifests(
      testDir,
      'src/dashboards/my-dashboard.manifest.ts',
      false,
    );
    expect(result.patched).toBe(false);
  });

  it('appends a second manifest after the first', async () => {
    await writeFile(join(testDir, 'src', 'bundle.manifests.ts'), PATCHED_ONCE, 'utf-8');

    const result = await patchBundleManifests(
      testDir,
      'src/sections/my-section.manifest.ts',
      false,
    );

    expect(result.patched).toBe(true);
    const written = await readFile(join(testDir, 'src', 'bundle.manifests.ts'), 'utf-8');
    expect(written).toContain("import { manifests as mySection } from './sections/my-section.manifest.js';");
    expect(written).toContain('...mySection,');
    // First registration must still be intact
    expect(written).toContain('...myDashboard,');
  });
});
