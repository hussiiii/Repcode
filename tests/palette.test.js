/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const config = require('../tailwind.config').default;
const retired = require('./fixtures/retired-styling.json');
const expectedRoles = { background: '#2A303C', foreground: '#FFFFFF', surface: '#343B4A', 'muted-foreground': '#B0B7C3', action: '#2563EB', accent: '#292929', border: '#3A4253', 'surface-inset': '#222526', 'surface-count': '#4A4A4A', 'difficulty-easy': '#34BF8F', 'study-new': '#60A5FA', 'status-overdue': '#FFA500' };

const samples = [
  ...Object.keys(expectedRoles).flatMap(name => [`bg-${name}`, `text-${name}`]),
  ...[...retired.colorAliases, ...retired.colorRoles].flatMap(name => [`bg-${name}`, `text-${name}`]),
  'text-white', 'text-black', 'bg-transparent', 'text-transparent', 'border-transparent',
  'from-transparent', 'bg-black/60', 'focus:border-blue-500',
  ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].flatMap(shade => [
    `bg-blue-${shade}`, `bg-neutral-${shade}`,
  ]),
  'bg-background', 'text-foreground', 'bg-surface', 'bg-surface-inset',
  'text-muted-foreground', 'bg-action', 'text-action-foreground',
  'border-border', 'divide-border', 'border-input', 'ring-ring', 'bg-accent', 'hover:bg-accent', 'text-accent-foreground',
  'bg-destructive', 'text-destructive-foreground',
  'bg-background/40', 'text-muted-foreground/50', 'bg-action/20', 'border-border/25',
];

let stylesheet;
let tokens;

beforeAll(async () => {
  const result = await postcss([
    tailwind({ ...config, content: [{ raw: samples.join(' '), extension: 'html' }] }),
  ]).process(fs.readFileSync(path.join(__dirname, '../src/styles/globals.css'), 'utf8'), {
    from: path.join(__dirname, '../src/styles/globals.css'),
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

test('canonical role utilities preserve the original design values', () => {
  for (const [name, hex] of Object.entries(expectedRoles)) {
    const expected = `rgb(${channels(hex)} / 1)`;
    expect(valueFor(`text-${name}`, 'color')).toBe(expected);
    expect(valueFor(`bg-${name}`, 'background-color')).toBe(expected);
  }
  expect(valueFor('hover:bg-accent', 'background-color', {}, ':hover')).toBe('rgb(41 41 41 / 1)');
});

test('retired aliases are absent from custom colors and no longer generate bare utilities', () => {
  for (const alias of [...retired.colorAliases, ...retired.colorRoles]) {
    expect(config.theme.extend.colors).not.toHaveProperty(alias);
    expect(rulesFor(`bg-${alias}`)).toHaveLength(0);
    expect(rulesFor(`text-${alias}`)).toHaveLength(0);
  }
});

test('transparent text, backgrounds, borders, and gradient stops are available', () => {
  expect(valueFor('text-transparent', 'color')).toBe('transparent');
  expect(valueFor('bg-transparent', 'background-color')).toBe('transparent');
  expect(valueFor('border-transparent', 'border-color')).toBe('transparent');
  expect(rulesFor('from-transparent')).toHaveLength(1);
});

test('canonical roles support opacity modifiers through their shared CSS variables', () => {
  expect(valueFor('bg-background/40', 'background-color')).toBe('rgb(42 48 60 / 0.4)');
  expect(valueFor('text-muted-foreground/50', 'color')).toBe('rgb(176 183 195 / 0.5)');
  expect(valueFor('bg-action/20', 'background-color')).toBe('rgb(37 99 235 / 0.2)');
  expect(valueFor('border-border/25', 'border-color')).toBe('rgb(58 66 83 / 0.25)');
});

test('text, action and border roles follow the central variables independently', () => {
  const foreground = { '--foreground': '12 34 56' };
  expect(valueFor('text-foreground', 'color', foreground)).toBe('rgb(12 34 56 / 1)');
  expect(valueFor('text-action-foreground', 'color', foreground)).toBe('rgb(12 34 56 / 1)');
  expect(valueFor('bg-action', 'background-color', { '--action': '98 76 54' })).toBe('rgb(98 76 54 / 1)');
  expect(valueFor('border-border', 'border-color')).toBe('rgb(58 66 83 / 1)');
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
