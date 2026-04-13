import { describe, it, expect } from 'vitest';
import { applyTemplate } from './template.js';

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
