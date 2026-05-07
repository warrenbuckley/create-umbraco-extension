import { describe, it, expect } from 'vitest';
import type { GeneratorContext } from '../types.js';
import dashboard from './dashboard/generator.js';
import section from './section/generator.js';
import entityAction from './entity-action/generator.js';
import entityBulkAction from './entity-bulk-action/generator.js';
import entityCreateOptionAction from './entity-create-option-action/generator.js';

function ctx(extensionName: string, withExample = false): GeneratorContext {
  return {
    projectName: 'my-plugin',
    aliasPrefix: 'My.Plugin',
    extensionName,
    outputDir: '/tmp/test',
    withExample,
  };
}

function noUnfilledTokens(content: string) {
  expect(content).not.toMatch(/\{\{[A-Z_]+\}\}/);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

describe('dashboard generator', () => {
  const answers = { label: 'My Dashboard', path: 'my-dashboard', weight: 100, sections: [] };

  it('generates exactly 2 files', async () => {
    const files = await dashboard.generate(answers, ctx('My Dashboard'));
    expect(files).toHaveLength(2);
  });

  it('outputs files into src/dashboards/ with kebab-case names', async () => {
    const files = await dashboard.generate(answers, ctx('My Dashboard'));
    expect(files[0].path).toBe('src/dashboards/my-dashboard.manifest.ts');
    expect(files[1].path).toBe('src/dashboards/my-dashboard.element.ts');
  });

  it('manifest contains the correct Umbraco alias', async () => {
    const files = await dashboard.generate(answers, ctx('My Dashboard'));
    expect(files[0].content).toContain('My.Plugin.Dashboard.MyDashboard');
  });

  it('element contains the correct tag name and class name', async () => {
    const files = await dashboard.generate(answers, ctx('My Dashboard'));
    expect(files[1].content).toContain('my-plugin-my-dashboard');
    expect(files[1].content).toContain('MyPluginMyDashboardElement');
  });

  it('leaves no unfilled tokens in either file', async () => {
    const files = await dashboard.generate(answers, ctx('My Dashboard'));
    files.forEach(f => noUnfilledTokens(f.content));
  });

  it('includes a section conditions block when sections are provided', async () => {
    const withSections = { ...answers, sections: ['Umb.Section.Content', 'Umb.Section.Media'] };
    const files = await dashboard.generate(withSections, ctx('My Dashboard'));
    expect(files[0].content).toContain('Umb.Condition.SectionAlias');
    expect(files[0].content).toContain('Umb.Section.Content');
    expect(files[0].content).toContain('Umb.Section.Media');
  });

  it('omits the section conditions block when no sections are provided', async () => {
    const files = await dashboard.generate(answers, ctx('My Dashboard'));
    expect(files[0].content).not.toContain('Umb.Condition.SectionAlias');
  });
});

// ─── Section ─────────────────────────────────────────────────────────────────

describe('section generator', () => {
  it('generates exactly 1 file', async () => {
    const files = await section.generate({}, ctx('My Section'));
    expect(files).toHaveLength(1);
  });

  it('outputs the manifest into src/sections/ with a kebab-case name', async () => {
    const files = await section.generate({}, ctx('My Section'));
    expect(files[0].path).toBe('src/sections/my-section.manifest.ts');
  });

  it('leaves no unfilled tokens', async () => {
    const files = await section.generate({}, ctx('My Section'));
    noUnfilledTokens(files[0].content);
  });
});

// ─── Entity Action ────────────────────────────────────────────────────────────

describe('entity action generator', () => {
  it('generates exactly 2 files', async () => {
    const files = await entityAction.generate({}, ctx('Delete Item'));
    expect(files).toHaveLength(2);
  });

  it('outputs files into src/entity-actions/', async () => {
    const files = await entityAction.generate({}, ctx('Delete Item'));
    expect(files[0].path).toBe('src/entity-actions/delete-item.manifest.ts');
    expect(files[1].path).toBe('src/entity-actions/delete-item.action.ts');
  });

  it('action class has the correct name', async () => {
    const files = await entityAction.generate({}, ctx('Delete Item'));
    expect(files[1].content).toContain('MyPluginDeleteItemAction');
  });

  it('leaves no unfilled tokens in either file', async () => {
    const files = await entityAction.generate({}, ctx('Delete Item'));
    files.forEach(f => noUnfilledTokens(f.content));
  });
});

// ─── Entity Bulk Action ───────────────────────────────────────────────────────

describe('entity bulk action generator', () => {
  it('generates exactly 2 files', async () => {
    const files = await entityBulkAction.generate({}, ctx('Delete Items'));
    expect(files).toHaveLength(2);
  });

  it('outputs files into src/entity-bulk-actions/', async () => {
    const files = await entityBulkAction.generate({}, ctx('Delete Items'));
    expect(files[0].path).toBe('src/entity-bulk-actions/delete-items.manifest.ts');
    expect(files[1].path).toBe('src/entity-bulk-actions/delete-items.action.ts');
  });

  it('action class includes the BulkAction suffix', async () => {
    const files = await entityBulkAction.generate({}, ctx('Delete Items'));
    expect(files[1].content).toContain('MyPluginDeleteItemsBulkAction');
  });

  it('leaves no unfilled tokens in either file', async () => {
    const files = await entityBulkAction.generate({}, ctx('Delete Items'));
    files.forEach(f => noUnfilledTokens(f.content));
  });
});

// ─── Entity Create Option Action ──────────────────────────────────────────────

describe('entity create option action generator', () => {
  it('generates exactly 2 files', async () => {
    const files = await entityCreateOptionAction.generate({}, ctx('Create Node'));
    expect(files).toHaveLength(2);
  });

  it('outputs files into src/entity-create-option-actions/', async () => {
    const files = await entityCreateOptionAction.generate({}, ctx('Create Node'));
    expect(files[0].path).toBe('src/entity-create-option-actions/create-node.manifest.ts');
    expect(files[1].path).toBe('src/entity-create-option-actions/create-node.action.ts');
  });

  it('action class includes the CreateOptionAction suffix', async () => {
    const files = await entityCreateOptionAction.generate({}, ctx('Create Node'));
    expect(files[1].content).toContain('MyPluginCreateNodeCreateOptionAction');
  });

  it('leaves no unfilled tokens in either file', async () => {
    const files = await entityCreateOptionAction.generate({}, ctx('Create Node'));
    files.forEach(f => noUnfilledTokens(f.content));
  });
});
