import { describe, it, expect } from 'vitest';
import { toPascalCase, toCamelCase, toKebabCase } from './strings.js';

describe('toPascalCase', () => {
  it('converts spaced words', () => {
    expect(toPascalCase('my dashboard')).toBe('MyDashboard');
  });

  it('converts kebab-case', () => {
    expect(toPascalCase('entity-action')).toBe('EntityAction');
  });

  it('converts snake_case', () => {
    expect(toPascalCase('my_plugin')).toBe('MyPlugin');
  });

  it('passes through PascalCase unchanged', () => {
    expect(toPascalCase('MyDashboard')).toBe('MyDashboard');
  });

  it('converts camelCase', () => {
    expect(toPascalCase('myPlugin')).toBe('MyPlugin');
  });

  it('handles single word', () => {
    expect(toPascalCase('dashboard')).toBe('Dashboard');
  });

  it('handles multiple separators mixed', () => {
    expect(toPascalCase('my-cool_dashboard item')).toBe('MyCoolDashboardItem');
  });
});

describe('toCamelCase', () => {
  it('converts spaced words', () => {
    expect(toCamelCase('my dashboard')).toBe('myDashboard');
  });

  it('converts kebab-case', () => {
    expect(toCamelCase('entity-action')).toBe('entityAction');
  });

  it('converts PascalCase', () => {
    expect(toCamelCase('MyPlugin')).toBe('myPlugin');
  });

  it('handles single word', () => {
    expect(toCamelCase('dashboard')).toBe('dashboard');
  });

  it('converts snake_case', () => {
    expect(toCamelCase('my_dashboard')).toBe('myDashboard');
  });
});

describe('toKebabCase', () => {
  it('converts spaced words', () => {
    expect(toKebabCase('my dashboard')).toBe('my-dashboard');
  });

  it('converts PascalCase', () => {
    expect(toKebabCase('EntityAction')).toBe('entity-action');
  });

  it('converts camelCase', () => {
    expect(toKebabCase('myPlugin')).toBe('my-plugin');
  });

  it('passes through kebab-case unchanged', () => {
    expect(toKebabCase('my-dashboard')).toBe('my-dashboard');
  });

  it('handles single word', () => {
    expect(toKebabCase('dashboard')).toBe('dashboard');
  });

  it('converts snake_case', () => {
    expect(toKebabCase('my_dashboard')).toBe('my-dashboard');
  });
});
