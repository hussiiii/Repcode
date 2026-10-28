/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const tailwind = require('tailwindcss');
const config = require('../tailwind.config').default;
const originalColors = require('./fixtures/home-colors.json');

const root = path.join(__dirname, '..');
const files = [
  'src/pages/index.tsx',
  ...fs.readdirSync(path.join(root, 'src/components/home')).filter(name => name.endsWith('.tsx'))
    .map(name => `src/components/home/${name}`),
  'src/components/ui/Badge.tsx',
];
const sources = files.map(file => fs.readFileSync(path.join(root, file), 'utf8'));
const colorClass = /^(?:(?:hover|focus|group-hover):)*(?:text|bg|border|from|via|to|fill|stroke|shadow|placeholder)-(?:marketing(?:-|$)|code-|difficulty-|study-|badge-|background$|surface(?:-|\/|$)|foreground(?:\/|$)|muted-foreground$|border$|placeholder$|dimmed(?:\/|$)|overlay(?:\/|$)|brand$)/;
const usedClasses = new Set();

for (let index = 0; index < files.length; index++) {
  const source = ts.createSourceFile(files[index], sources[index], ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
      || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      node.text.split(/\s+/).filter(value => colorClass.test(value)).forEach(value => usedClasses.add(value));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

let stylesheet;
let variables;
let classRules;

beforeAll(async () => {
  const probes = Object.keys(originalColors).map(name => `text-${name}`).join(' ');
  const result = await postcss([tailwind({ ...config, content: [
    ...sources.map(raw => ({ raw, extension: 'tsx' })),
    { raw: probes, extension: 'html' },
  ] })]).process(fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8'), {
    from: path.join(root, 'src/app/globals.css'),
  });
  stylesheet = result.root;
  variables = {};
  classRules = new Map();
  stylesheet.walkRules(rule => {
    if (rule.selector === ':root' || (rule.selector.includes('*') && rule.selector.includes('::before'))) {
      rule.walkDecls(decl => { variables[decl.prop] = decl.value; });
    }
    selectorParser(selectors => selectors.walkClasses(node => {
      if (!classRules.has(node.value)) classRules.set(node.value, []);
      classRules.get(node.value).push(rule);
    })).processSync(rule.selector);
  });
});

function resolve(value, overrides = {}) {
  return value.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g, (_, name, fallback) => {
    const replacement = overrides[name] ?? variables[name] ?? fallback;
    if (replacement === undefined) throw new Error(`Undefined color variable ${name}`);
    return resolve(replacement, overrides);
  });
}

function declaration(name, property, overrides = {}) {
  const rules = classRules.get(name);
  expect(rules).toBeDefined();
  const values = {};
  rules.forEach(rule => rule.walkDecls(decl => { values[decl.prop] = decl.value; }));
  expect(values[property]).toBeDefined();
  return resolve(values[property], { ...values, ...overrides });
}

function rgb(hex) {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16)).join(' ');
}

test('all migrated roles preserve the colors recorded before migration', () => {
  for (const [name, hex] of Object.entries(originalColors)) {
    expect(declaration(`text-${name}`, 'color')).toBe(`rgb(${rgb(hex)} / 1)`);
  }
});

test('every semantic color utility used by the homepage and shared badges generates valid CSS', () => {
  expect(usedClasses.size).toBeGreaterThan(90);
  for (const name of usedClasses) {
    expect(classRules.has(name)).toBe(true);
    classRules.get(name).forEach(rule => rule.walkDecls(decl => {
      // Tailwind shadow/ring machinery has its own runtime defaults; check palette references.
      for (const match of decl.value.matchAll(/var\((--(?:marketing|code|difficulty|study|foreground|background|surface|muted|border|badge|overlay)[\w-]*)\)/g)) {
        expect(resolve(`var(${match[1]})`)).toBeDefined();
      }
    }));
  }
});

test('homepage colors stay centralized, including SVG attributes and inline styles', () => {
  sources.forEach(source => {
    expect(source).not.toMatch(/#[\da-f]{3,8}\b|\brgba?\(\s*\d|\bhsla?\(\s*\d/i);
    expect(source).not.toMatch(/\b(?:text|bg|border|from|via|to|fill|stroke|shadow)-(?:primary|secondary|pop|base_100|cards|easybg|newbg|warningbg)\b/);
    expect(source).not.toMatch(/\b(?:text|bg|border|from|via|to|fill|stroke|shadow)-(?:blue|gray|slate|neutral|cyan|green|red|yellow|purple|white|black)(?:-\d+)?\b/);
  });
});

test('hover gradients, focus borders, translucent surfaces, and placeholders retain their states', () => {
  expect(declaration('hover:from-marketing-action-hover-start', '--tw-gradient-from')).toContain('rgb(8 145 178 / 1)');
  expect(declaration('hover:to-marketing-action-hover-end', '--tw-gradient-to')).toContain('rgb(37 99 235 / 1)');
  expect(declaration('focus:border-marketing-focus', 'border-color')).toBe('rgb(59 130 246 / 1)');
  expect(declaration('bg-surface/70', 'background-color')).toBe('rgb(52 59 74 / 0.7)');
  expect(declaration('bg-surface/95', 'background-color')).toBe('rgb(52 59 74 / 0.95)');
  expect(declaration('placeholder:text-placeholder', 'color')).toBe('rgb(138 148 166 / 1)');
});

test('badge hover colors remain distinct for every difficulty and study state', () => {
  for (const name of ['difficulty-easy', 'difficulty-medium', 'difficulty-hard', 'study-new', 'study-learning', 'study-review']) {
    expect(declaration(`hover:text-${name}-hover`, 'color')).toBe(`rgb(${rgb(originalColors[`${name}-hover`])} / 1)`);
  }
});

test('marketing shadows retain their geometry, tint, and hover opacity', () => {
  expect(declaration('hover:shadow-marketing-card', '--tw-shadow')).toBe('0 4px 14px 0 rgb(59 130 246 / 0.1)');
  expect(declaration('hover:shadow-marketing-comparison', '--tw-shadow')).toBe('0 4px 20px 0 rgb(59 130 246 / 0.1)');
  expect(declaration('hover:shadow-marketing-action-hover', '--tw-shadow')).toBe('0 4px 14px 0 rgb(59 130 246 / 0.3)');
  expect(declaration('hover:shadow-marketing-nav-button-hover', '--tw-shadow')).toBe('0 10px 15px -3px rgb(59 130 246 / 0.3), 0 4px 6px -4px rgb(59 130 246 / 0.3)');
});

test('changing marketing action colors leaves application actions and domain states independent', () => {
  const overrides = { '--marketing-action-start': '1 2 3', '--marketing-action-end': '4 5 6' };
  expect(declaration('text-marketing-action-start', 'color', overrides)).toBe('rgb(1 2 3 / 1)');
  expect(declaration('text-marketing-action-end', 'color', overrides)).toBe('rgb(4 5 6 / 1)');
  expect(resolve('rgb(var(--action))', overrides)).toBe('rgb(37 99 235)');
  expect(resolve('rgb(var(--difficulty-easy))', overrides)).toBe('rgb(52 191 143)');
  expect(resolve('rgb(var(--status-error))', overrides)).toBe('rgb(255 107 107)');
});
