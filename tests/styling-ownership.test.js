/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const postcss = require('postcss');
const retired = require('./fixtures/retired-styling.json');
const root = path.join(__dirname, '..');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const files = walk(path.join(root, 'src'));
const cssFiles = files.filter(file => file.endsWith('.css'));
const globals = fs.readFileSync(path.join(root, 'src/styles/globals.css'), 'utf8');

it('limits the global entry to Tailwind, palette, and document defaults', () => {
  const selectors = [];
  const sheet = postcss.parse(globals);
  sheet.walkRules(rule => selectors.push(rule.selector.replace(/\s+/g, ' ')));
  expect(selectors).toEqual([':root', 'input::placeholder, textarea::placeholder', 'body']);
  const animations = [];
  sheet.walkAtRules('keyframes', rule => animations.push(rule.params));
  expect(animations).toEqual([]);
  for (const file of cssFiles) {
    expect(file.endsWith('.module.css') || file.endsWith('/styles/globals.css') || file.endsWith('/styles/vendor-colors.css')).toBe(true);
  }
});

it('loads global and vendor styles once from the Pages Router entry, before token overrides', () => {
  const imports = [];
  for (const file of files.filter(file => /\.(tsx?|jsx?)$/.test(file))) {
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const statement of sf.statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      const module = statement.moduleSpecifier.text;
      if (module.endsWith('.css') && !module.endsWith('.module.css')) imports.push({ file: path.relative(root, file), module });
    }
  }
  expect(new Set(imports.map(item => item.file))).toEqual(new Set(['src/pages/_app.tsx']));
  const modules = imports.map(item => item.module);
  expect(new Set(modules).size).toBe(modules.length);
  expect(modules).toContain('../styles/globals.css');
  const overrides = modules.indexOf('../styles/vendor-colors.css');
  for (const original of ['nprogress/nprogress.css', 'highlight.js/styles/atom-one-dark-reasonable.css']) expect(modules.indexOf(original)).toBeLessThan(overrides);
  expect(fs.existsSync(path.join(root, 'src/app/globals.css'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'useDarkMode.js'))).toBe(false);
});

it('prevents retired palette aliases and custom global classes from returning', () => {
  const alias = [...retired.colorAliases, ...retired.colorRoles].join('|');
  const oldUtility = new RegExp('^(?:text|bg|border(?:-[trblxy])?|divide(?:-[xy])?|ring(?:-offset)?|fill|stroke|shadow|placeholder|from|via|to|accent|decoration|caret|outline)-(' + alias + ')(?:-foreground)?(?:/[^ ]+)?$');
  const violations = [];
  for (const file of files.filter(file => /\.(tsx?|jsx?)$/.test(file))) {
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        for (const value of node.text.split(/\s+/)) if (oldUtility.test(value.split(':').at(-1)) || retired.globalClasses.includes(value)) violations.push(path.relative(root, file) + ': ' + value);
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  expect(violations).toEqual([]);
  const declared = [];
  for (const file of cssFiles) postcss.parse(fs.readFileSync(file, 'utf8')).walkDecls(decl => declared.push(decl.prop));
  for (const variable of retired.variables) expect(declared).not.toContain('--' + variable);
});

it('scopes imported problem content and public anchor offsets to their owners', () => {
  const typography = fs.readFileSync(path.join(root, 'src/components/ui/typography.module.css'), 'utf8');
  expect(typography).toContain('.description');
  expect(typography).toContain('.inverted a');
  expect(typography).not.toMatch(/\.prose-invert|\.problem-content/);
  const shell = fs.readFileSync(path.join(root, 'src/components/layout/public-shell.module.css'), 'utf8');
  expect(shell).toContain('.publicContent [id]');
  expect(shell).toContain('scroll-margin-top: 113px');
  expect(globals).not.toContain('[id]');
});

it('owns animations in component modules with a reduced-motion alternative', () => {
  for (const name of ['home/NavBar', 'ui/dialog', 'ui/toast']) {
    const css = fs.readFileSync(path.join(root, 'src/components', name + '.module.css'), 'utf8');
    expect(css).toContain('@keyframes');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('animation: none');
  }
  const navbar = fs.readFileSync(path.join(root, 'src/components/home/NavBar.tsx'), 'utf8');
  expect(navbar).not.toContain('<style');
  expect(navbar).not.toContain("animation: 'ping");
});
