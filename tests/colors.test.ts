/** @jest-environment jsdom */
import fs from 'node:fs';
import path from 'node:path';
import { cssColor, canvasColor, hexColor, collectionChartColor, withColorOpacity } from '@/lib/colors';
const originals = require('./fixtures/app-colors.json');

beforeAll(() => {
  const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const declarations = css.match(/:root\s*\{([\s\S]*?)\n  \}/)![1];
  const style = document.createElement('style');
  style.textContent = `:root {${declarations}}`;
  document.head.append(style);
});

function rgba(value: string): number[] {
  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).concat(hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1);
  }
  const values = value.slice(value.indexOf('(') + 1, -1).split(',').map(Number);
  return values.length === 3 ? [...values, 1] : values;
}

test('DOM colors retain CSS variable references and requested opacity', () => {
  expect(cssColor('app-action-start')).toBe('rgb(var(--app-action-start) / 1)');
  expect(cssColor('overlay', 0.6)).toBe('rgb(var(--overlay) / 0.6)');
});

test('canvas colors resolve every migrated inline color to its original numeric values', () => {
  for (const sample of originals.inline) {
    expect(rgba(canvasColor(sample.token, sample.opacity))).toEqual(rgba(sample.original));
    expect(canvasColor(sample.token, sample.opacity)).not.toContain('var(');
  }
});

test('palette aliases resolve for canvas rendering', () => {
  expect(canvasColor('study-review-background')).toBe('rgba(49, 73, 80, 1)');
  expect(canvasColor('action-foreground', 0.25)).toBe('rgba(255, 255, 255, 0.25)');
});

test('hex-only library APIs receive valid hex rather than CSS variables or rgb functions', () => {
  expect(hexColor('app-action-end')).toBe('#3b82f6');
  expect(hexColor('foreground')).toBe('#ffffff');
});

test('collection chart hue generation keeps its original offset, saturation, and lightness', () => {
  expect(collectionChartColor(0, 3)).toBe('hsla(200, 70%, 60%, 0.85)');
  expect(collectionChartColor(1, 3)).toBe('hsla(320, 70%, 60%, 0.85)');
  expect(collectionChartColor(2, 3)).toBe('hsla(80, 70%, 60%, 0.85)');
});

test('chart alpha replacement changes only opacity, including colors with similar hue digits', () => {
  expect(withColorOpacity('rgba(59, 130, 246, 0.85)', 1)).toBe('rgba(59, 130, 246, 1)');
  expect(withColorOpacity('hsla(200.85, 70%, 60%, 0.85)', 1)).toBe('hsla(200.85, 70%, 60%, 1)');
  expect(withColorOpacity('transparent', 1)).toBe('transparent');
});

test('missing or malformed tokens fail clearly rather than silently rendering invalid canvas colors', () => {
  expect(() => canvasColor('missing-test-token')).toThrow('Undefined color token');
  document.documentElement.style.setProperty('--invalid-test-token', 'not-rgb');
  expect(() => canvasColor('invalid-test-token')).toThrow('Invalid RGB color token');
  document.documentElement.style.removeProperty('--invalid-test-token');
});
