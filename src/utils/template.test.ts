import { describe, it, expect } from 'vitest';
import { applyTemplate, loadTemplate } from './template.js';

describe('applyTemplate', () => {
  it('replaces a single token', () => {
    expect(applyTemplate('class {{CLASS_NAME}} {}', { CLASS_NAME: 'MyElement' }))
      .toBe('class MyElement {}');
  });

  it('replaces multiple tokens', () => {
    expect(applyTemplate('alias: {{ALIAS}}, name: {{NAME}}', { ALIAS: 'My.Alias', NAME: 'My Name' }))
      .toBe('alias: My.Alias, name: My Name');
  });

  it('replaces all occurrences of the same token', () => {
    expect(applyTemplate('{{NAME}} is {{NAME}}', { NAME: 'cool' }))
      .toBe('cool is cool');
  });

  it('leaves unknown tokens unchanged', () => {
    expect(applyTemplate('{{UNKNOWN}}', { NAME: 'ignored' }))
      .toBe('{{UNKNOWN}}');
  });

  it('returns the template unchanged when tokens map is empty', () => {
    const tpl = 'no tokens here';
    expect(applyTemplate(tpl, {})).toBe(tpl);
  });

  it('handles token adjacent to other text', () => {
    expect(applyTemplate('./{{KEBAB_NAME}}.element', { KEBAB_NAME: 'my-dashboard' }))
      .toBe('./my-dashboard.element');
  });
});

describe('loadTemplate', () => {
  it('loads a scaffold template and returns its content', async () => {
    const content = await loadTemplate('dashboard', 'manifest.ts');
    expect(content).toContain('{{ALIAS}}');
    expect(content).toContain('{{NAME}}');
  });

  it('loads scaffold when withExample is false', async () => {
    const content = await loadTemplate('dashboard', 'element.ts', false);
    expect(content).toContain('{{CLASS_NAME}}');
    expect(content).toContain('{{TAG_NAME}}');
  });

  it('loads the example variant when withExample is true and example exists', async () => {
    const scaffold = await loadTemplate('dashboard', 'element.ts', false);
    const example = await loadTemplate('dashboard', 'element.ts', true);
    expect(example).not.toBe(scaffold);
  });

  it('falls back to scaffold when no example variant exists for that type', async () => {
    // project/ has no example/ directory — withExample=true must return the scaffold
    const scaffold = await loadTemplate('project', 'vite.config.ts', false);
    const withExample = await loadTemplate('project', 'vite.config.ts', true);
    expect(withExample).toBe(scaffold);
  });

  it('rejects when the requested file does not exist', async () => {
    await expect(loadTemplate('dashboard', 'nonexistent.ts')).rejects.toThrow();
  });
});
