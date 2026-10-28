/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const tailwind = require('tailwindcss');
const config = require('../tailwind.config').default;
const original = require('./fixtures/app-colors.json');

const root = path.join(__dirname, '..');
function filesIn(dir) {
  return fs.readdirSync(dir).flatMap(name => {
    const file = path.join(dir, name);
    return fs.statSync(file).isDirectory() ? filesIn(file) : [file];
  });
}
const files = filesIn(path.join(root, 'src')).filter(file => /\.(?:tsx?|css)$/.test(file));
const sources = files.map(file => fs.readFileSync(file, 'utf8'));
let variables;
let stylesheet;
let classes;

beforeAll(async () => {
  const probes = Object.keys(original.roles).map(name => `text-${name}`).join(' ');
  const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
  const result = await postcss([tailwind({ ...config, content: [
    ...sources.map(raw => ({ raw, extension: 'tsx' })), { raw: probes, extension: 'html' },
  ] })]).process(css, { from: path.join(root, 'src/app/globals.css') });
  stylesheet = result.root;
  variables = {};
  classes = new Map();
  stylesheet.walkRules(rule => {
    if (rule.selector === ':root') rule.walkDecls(decl => { variables[decl.prop] = decl.value; });
    selectorParser(selectors => selectors.walkClasses(node => {
      if (!classes.has(node.value)) classes.set(node.value, []);
      classes.get(node.value).push(rule);
    })).processSync(rule.selector);
  });
});

function resolve(value, locals = {}) {
  return value.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g, (_, name, fallback) => {
    const replacement = locals[name] ?? variables[name] ?? fallback;
    if (replacement === undefined) throw new Error(`Undefined palette variable ${name}`);
    return resolve(replacement, locals);
  });
}

function normalize(value) {
  return value.replace(/#[\da-f]{3,8}\b/gi, hex => {
    let h = hex.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
    const rgb = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).join(' ');
    return `rgb(${rgb} / ${h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1})`;
  }).replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g,
    (_, r, g, b, a = 1) => `rgb(${r} ${g} ${b} / ${Number(a)})`)
    .replace(/rgb\((\d+\s+\d+\s+\d+)\)/g, 'rgb($1 / 1)')
    .replace(/\s*\/\s*/g, '/').replace(/\/(\.\d+)/g, '/0$1').replace(/\s+/g, ' ').trim();
}

test('all migrated application roles keep their original RGB values in generated Tailwind CSS', () => {
  for (const [name, hex] of Object.entries(original.roles)) {
    const rule = classes.get(`text-${name}`);
    expect(rule).toBeDefined();
    const declarations = Object.fromEntries(rule[0].nodes.filter(n => n.type === 'decl').map(n => [n.prop, n.value]));
    expect(normalize(resolve(declarations.color, declarations))).toBe(normalize('#' + hex));
  }
});

test('inline, SVG, chart, and canvas substitutions preserve their recorded channel values', () => {
  for (const sample of original.inline) {
    const channels = resolve(`var(--${sample.token})`).split(/\s+/).map(Number);
    const value = `rgba(${channels.join(',')},${sample.opacity})`;
    expect(normalize(value)).toBe(normalize(sample.original));
  }
});

test('the entire first-party source stays free of literal colors and literal Tailwind palette choices', () => {
  files.forEach((file, index) => {
    const source = sources[index];
    expect({ file, literals: source.match(/#[\da-f]{3,8}\b|\brgba?\(\s*\d|\bhsla?\(\s*\d/gi) }).toEqual({ file, literals: null });
    expect({ file, utilities: file.endsWith('.css') ? null : source.match(/\b(?:text|bg|border|from|via|to|ring|shadow|fill|stroke|outline|placeholder|accent|decoration|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d+)?(?:\/\d+)?\b/g) }).toEqual({ file, utilities: null });
  });
});

test('every color variable and literal helper argument used anywhere in the app is defined', () => {
  const declared = new Set();
  sources.forEach(source => {
    for (const match of source.matchAll(/(--[\w-]+)\s*:/g)) declared.add(match[1]);
  });
  sources.forEach(source => {
    for (const match of source.matchAll(/var\((--[\w-]+)/g)) {
      if (!match[1].startsWith('--tw-')) expect(declared.has(match[1])).toBe(true);
    }
    for (const match of source.matchAll(/\b(?:cssColor|canvasColor|hexColor)\(['"]([\w-]+)['"]/g)) {
      expect(variables[`--${match[1]}`]).toBeDefined();
      expect(resolve(`var(--${match[1]})`)).toMatch(/^\d+ \d+ \d+$/);
    }
  });
});

test('semantic color classes used across all routes and components generate actual CSS', () => {
  function flatten(object, prefix = '', result = new Set()) {
    for (const [key, value] of Object.entries(object)) {
      const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key;
      if (typeof value === 'object') flatten(value, name, result); else result.add(name);
    }
    return result;
  }
  const names = flatten(config.theme.extend.colors);
  const used = new Set();
  files.forEach((file, index) => {
    if (file.endsWith('.css')) return;
    const source = ts.createSourceFile(file, sources[index], ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        for (const candidate of node.text.split(/\s+/)) {
          const core = candidate.split(':').at(-1);
          const match = core.match(/^(?:text|bg|border(?:-[lrtbxy])?|from|via|to|ring(?:-offset)?|shadow|fill|stroke|outline|placeholder|accent|decoration|caret)-(.+)$/);
          if (match && (names.has(match[1].split('/')[0]) || /\[.*var\(--/.test(match[1]))) used.add(candidate);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  });
  expect(used.size).toBeGreaterThan(200);
  const missing = [...used].filter(name => !classes.has(name));
  expect(missing).toEqual([]);
});

test('library color overrides exactly preserve installed editor, highlighting, and progress themes', () => {
  const ace = fs.readFileSync(path.join(root, 'node_modules/ace-builds/src-noconflict/theme-one_dark.js'), 'utf8');
  const aceCss = JSON.parse(ace.match(/module\.exports = ("(?:[^"\\]|\\.)*");/s)[1]);
  const originals = [aceCss,
    fs.readFileSync(path.join(root, 'node_modules/highlight.js/styles/atom-one-dark-reasonable.css'), 'utf8'),
    fs.readFileSync(path.join(root, 'node_modules/nprogress/nprogress.css'), 'utf8'),
  ];
  const overrides = postcss.parse(fs.readFileSync(path.join(root, 'src/styles/vendor-colors.css'), 'utf8'));
  let checked = 0;
  for (const css of originals) postcss.parse(css).walkRules(rule => {
    const selector = rule.selector.split(',').map(s => s.trim().replace(/([.#][\w-]+)/, '$1$1')).join(',\n');
    rule.walkDecls(decl => {
      if (!/#[\da-f]{3,8}\b|rgba?\(/i.test(decl.value)) return;
      let replacement;
      overrides.walkRules(candidate => {
        if (candidate.selector === selector) candidate.walkDecls(decl.prop, value => { replacement = value.value; });
      });
      expect(replacement).toBeDefined();
      expect(normalize(resolve(replacement))).toBe(normalize(decl.value));
      checked++;
    });
  });
  expect(checked).toBe(65);
});

test('React Tooltip default colors retain their installed values through shared variables', () => {
  const defaults = postcss.parse(fs.readFileSync(path.join(root, 'node_modules/react-tooltip/dist/react-tooltip.css'), 'utf8'));
  const overrides = postcss.parse(fs.readFileSync(path.join(root, 'src/styles/vendor-colors.css'), 'utf8'));
  let checked = 0;
  defaults.walkDecls(/^--rt-color-/, decl => {
    let replacement;
    overrides.walkRules('html:root', rule => rule.walkDecls(decl.prop, candidate => { replacement = candidate.value; }));
    expect(replacement).toBeDefined();
    expect(normalize(resolve(replacement))).toBe(normalize(decl.value));
    checked++;
  });
  expect(checked).toBe(6);
});

test('Tailwind defaults for shadows, placeholders, and rings keep their old values through tokens', () => {
  const defaults = require('tailwindcss/defaultTheme');
  const shadow = classes.get('shadow-lg')[0].nodes.find(node => node.prop === '--tw-shadow');
  expect(shadow.value).toContain('var(--shadow-color)');
  expect(normalize(resolve(shadow.value))).toBe(normalize(defaults.boxShadow.lg));
  const placeholders = [];
  const rings = [];
  stylesheet.walkRules(rule => {
    if (rule.selector.replace(/\s+/g, '') === 'input::placeholder,textarea::placeholder') {
      rule.walkDecls('color', decl => placeholders.push(decl.value));
    }
    if (rule.selector.includes('*') && rule.selector.includes('::before')) {
      rule.walkDecls('--tw-ring-color', decl => rings.push(decl.value));
      rule.walkDecls('--tw-ring-offset-color', decl => rings.push(decl.value));
    }
  });
  expect(placeholders.at(-1)).toContain('var(--placeholder-default)');
  expect(normalize(resolve(placeholders.at(-1)))).toBe(normalize('#9ca3af'));
  expect(normalize(resolve(rings[0]))).toBe(normalize('rgba(59,130,246,0.5)'));
  expect(normalize(resolve(rings[1]))).toBe(normalize('#ffffff'));
});
