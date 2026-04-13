import { describe, it, expect } from 'vitest';
import { normalisePrefix, toUmbracoAlias } from './alias.js';

describe('normalisePrefix', () => {
  it('passes through already-correct dot-notation', () => {
    expect(normalisePrefix('My.Plugin')).toBe('My.Plugin');
  });

  it('capitalises lowercase segments', () => {
    expect(normalisePrefix('my.plugin')).toBe('My.Plugin');
  });

  it('converts spaced words within a segment', () => {
    expect(normalisePrefix('my plugin')).toBe('MyPlugin');
  });

  it('converts hyphenated segment', () => {
    expect(normalisePrefix('my-plugin')).toBe('MyPlugin');
  });

  it('handles multiple dot segments with mixed casing', () => {
    expect(normalisePrefix('my.cool plugin')).toBe('My.CoolPlugin');
  });

  it('handles three dot segments', () => {
    expect(normalisePrefix('warren.umbraco.plugin')).toBe('Warren.Umbraco.Plugin');
  });
});

describe('toUmbracoAlias', () => {
  it('builds a fully-qualified alias from clean inputs', () => {
    expect(toUmbracoAlias('My.Plugin', 'Dashboard', 'MyDashboard'))
      .toBe('My.Plugin.Dashboard.MyDashboard');
  });

  it('normalises a lowercase prefix', () => {
    expect(toUmbracoAlias('my.plugin', 'Dashboard', 'My Dashboard'))
      .toBe('My.Plugin.Dashboard.MyDashboard');
  });

  it('PascalCases a camelCase type segment', () => {
    expect(toUmbracoAlias('My.Plugin', 'entityAction', 'Delete Page'))
      .toBe('My.Plugin.EntityAction.DeletePage');
  });

  it('handles a multi-word extension name', () => {
    expect(toUmbracoAlias('My.Plugin', 'dashboard', 'Cool Dashboard'))
      .toBe('My.Plugin.Dashboard.CoolDashboard');
  });

  it('handles a hyphenated prefix', () => {
    expect(toUmbracoAlias('my-plugin', 'propertyEditorUi', 'Rich Text'))
      .toBe('MyPlugin.PropertyEditorUi.RichText');
  });
});
