/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const config = require('../tailwind.config').default;
const legacyColors = require('./fixtures/legacy-colors.json');

const samples = [
  ...Object.keys(legacyColors).flatMap(name => [`bg-${name}`, `text-${name}`]),
  'text-white', 'text-black', 'bg-transparent', 'text-transparent', 'border-transparent',
  'from-transparent', 'bg-black/60', 'focus:border-blue-500',
  ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].flatMap(shade => [
    `bg-blue-${shade}`, `bg-neutral-${shade}`,
  ]),
  'bg-background', 'text-foreground', 'bg-surface', 'bg-surface-inset',
  'text-muted-foreground', 'bg-action', 'text-action-foreground',
  'border-border', 'border-divide', 'border-input', 'ring-ring', 'text-primary-foreground',
  'text-secondary-foreground', 'bg-accent', 'text-accent-foreground',
  'bg-destructive', 'text-destructive-foreground',
  'bg-base_100/40', 'text-secondary/50', 'bg-blue/20', 'border-divide/25',
];

let stylesheet;
let tokens;

beforeAll(async () => {
  const result = await postcss([
    tailwind({ ...config, content: [{ raw: samples.join(' '), extension: 'html' }] }),
  ]).process(fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8'), {
    from: path.join(__dirname, '../src/app/globals.css'),
  });
  stylesheet = result.root;
  tokens = {};
  stylesheet.walkRules(':root', rule => {
    rule.walkDecls(decl => { tokens[decl.prop] = decl.value; });
  });
});

function rulesFor(name, state = '') {
  const selector = '.' + name.replace(/([^\w-])/g, '\\$1') + state;
  const matches = [];
  stylesheet.walkRules(rule => { if (rule.selector === selector) matches.push(rule); });
  return matches;
}

// Resolve this palette's channel aliases and Tailwind's per-utility opacity values.
function valueFor(name, property, overrides = {}, state = '') {
  const rules = rulesFor(name, state);
  expect(rules).toHaveLength(1);
  const declarations = Object.fromEntries(rules[0].nodes
    .filter(node => node.type === 'decl').map(decl => [decl.prop, decl.value]));
  const variables = { ...tokens, ...declarations, ...overrides };
  function resolve(value) {
    return value.replace(/var\((--[\w-]+)(?:,\s*([^()]+))?\)/g, (_, name, fallback) => {
      const replacement = variables[name] ?? fallback;
      if (replacement === undefined) throw new Error(`Undefined palette variable ${name}`);
      return resolve(replacement);
    });
  }
  expect(declarations[property]).toBeDefined();
  return resolve(declarations[property]).replace(/\s+/g, ' ').trim();
}

function channels(hex) {
  const value = hex.slice(1);
  const expanded = value.length === 3 ? value.split('').map(c => c + c).join('') : value;
  return [0, 2, 4].map(start => parseInt(expanded.slice(start, start + 2), 16)).join(' ');
}

test('standard Tailwind colors and full blue and neutral scales generate usable CSS', () => {
  expect(valueFor('text-white', 'color')).toBe('rgb(255 255 255 / 1)');
  expect(valueFor('text-black', 'color')).toBe('rgb(0 0 0 / 1)');
  expect(valueFor('bg-black/60', 'background-color')).toBe('rgb(0 0 0 / 0.6)');
  for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
    expect(rulesFor(`bg-blue-${shade}`)).toHaveLength(1);
    expect(rulesFor(`bg-neutral-${shade}`)).toHaveLength(1);
  }
  expect(valueFor('bg-blue-500', 'background-color')).toBe('rgb(59 130 246 / 1)');
  expect(valueFor('focus:border-blue-500', 'border-color', {}, ':focus')).toBe('rgb(59 130 246 / 1)');
});

test('every legacy foreground and background alias retains its original palette value', () => {
  for (const [name, hex] of Object.entries(legacyColors)) {
    const expected = `rgb(${channels(hex)} / 1)`;
    expect(valueFor(`text-${name}`, 'color')).toBe(expected);
    expect(valueFor(`bg-${name}`, 'background-color')).toBe(expected);
  }
});

test('transparent text, backgrounds, borders, and gradient stops are available', () => {
  expect(valueFor('text-transparent', 'color')).toBe('transparent');
  expect(valueFor('bg-transparent', 'background-color')).toBe('transparent');
  expect(valueFor('border-transparent', 'border-color')).toBe('transparent');
  expect(rulesFor('from-transparent')).toHaveLength(1);
});

test('legacy colors support opacity modifiers through their shared CSS variables', () => {
  expect(valueFor('bg-base_100/40', 'background-color')).toBe('rgb(42 48 60 / 0.4)');
  expect(valueFor('text-secondary/50', 'color')).toBe('rgb(176 183 195 / 0.5)');
  expect(valueFor('bg-blue/20', 'background-color')).toBe('rgb(37 99 235 / 0.2)');
  expect(valueFor('border-divide/25', 'border-color')).toBe('rgb(58 66 83 / 0.25)');
});

test('role utilities and compatibility aliases follow the same central color values', () => {
  const foreground = { '--foreground': '12 34 56' };
  expect(valueFor('text-foreground', 'color', foreground)).toBe('rgb(12 34 56 / 1)');
  expect(valueFor('text-primary', 'color', foreground)).toBe('rgb(12 34 56 / 1)');
  expect(valueFor('text-action-foreground', 'color', foreground)).toBe('rgb(12 34 56 / 1)');
  const action = { '--action': '98 76 54' };
  expect(valueFor('bg-action', 'background-color', action)).toBe('rgb(98 76 54 / 1)');
  expect(valueFor('bg-blue', 'background-color', action)).toBe('rgb(98 76 54 / 1)');
  expect(valueFor('border-border', 'border-color')).toBe(valueFor('border-divide', 'border-color'));
});

test('the dark picker surface is explicit and bg-grey has a single consistent definition', () => {
  expect(valueFor('bg-surface-inset', 'background-color')).toBe('rgb(34 37 38 / 1)');
  expect(valueFor('bg-grey', 'background-color')).toBe('rgb(165 169 174 / 1)');
});

test('restoring the default palette preserves the previous uncolored border behavior', () => {
  const defaults = [];
  stylesheet.walkRules(rule => {
    if (rule.selector.includes('::before') && rule.selector.includes('*')) {
      rule.walkDecls('border-color', decl => defaults.push(decl.value));
    }
  });
  expect(defaults).toEqual(['currentColor']);
});
