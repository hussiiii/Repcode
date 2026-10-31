/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const config = require('../components.json');
const pending = [];
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const files = walk(path.join(__dirname, '../src')).filter(file => file.endsWith('.tsx'));

it('configures repository-owned components for the existing Pages Router and Tailwind setup', () => {
  expect(config.rsc).toBe(false);
  expect(config.tsx).toBe(true);
  expect(config.style).toBe('new-york');
  expect(config.tailwind.cssVariables).toBe(true);
  expect(config.aliases.ui).toBe('@/components/ui');
  expect(config.aliases.utils).toBe('@/lib/utils');
  expect(fs.existsSync(path.join(__dirname, '..', config.tailwind.css))).toBe(true);
  expect(fs.existsSync(path.join(__dirname, '..', config.tailwind.config))).toBe(true);
});

it('prevents native button implementations outside the shared action primitive', () => {
  const actual = [];
  for (const file of files) {
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(sf) === 'button') {
        actual.push({ file: path.relative(path.join(__dirname, '..'), file), signature: node.attributes.properties.filter(a => ts.isJsxAttribute(a) && ['onClick', 'id'].includes(a.name.text)).map(a => a.getText(sf).replace(/\s+/g, ' ')).join(' ') });
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  const sort = rows => rows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  expect(sort(actual)).toEqual(sort(pending.map(({ file, signature }) => ({ file, signature }))));
  for (const item of pending) expect(item.kind).toBeTruthy();
});

it('keeps migrated button appearance in shared recipes and only layout at call sites', () => {
  const invalid = [];
  for (const file of files) {
    if (file.endsWith('/ui/button.tsx')) continue;
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(sf) === 'Button') {
        const inlineStyle = node.attributes.properties.find(a => ts.isJsxAttribute(a) && a.name.text === 'style');
        if (inlineStyle && /\b(?:color|background|boxShadow|border|padding|font)\w*\s*:/.test(inlineStyle.getText(sf))) invalid.push(file + ': inline visual override');
        const attribute = node.attributes.properties.find(a => ts.isJsxAttribute(a) && a.name.text === 'className');
        if (attribute) {
          if (!attribute.initializer || !ts.isStringLiteral(attribute.initializer)) invalid.push(file + ': dynamic visual override');
          else for (const utility of attribute.initializer.text.split(/\s+/).filter(Boolean)) {
            if (!/^(?:(?:sm|md|lg|xl):)*(?:-?(?:m[trblxy]?|w|min-w|max-w|top|bottom|left|right|inset|z)-|absolute$|relative$|transform$|-translate-[xy]-|flex$|items-|justify-|flex-shrink-|group$)/.test(utility)) invalid.push(file + ': ' + utility);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  expect(invalid).toEqual([]);
});


it('keeps Next client directives before imports and other statements', () => {
  for (const file of files) {
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    sf.statements.forEach((statement, index) => {
      if (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression) && statement.expression.text === 'use client') expect({ file, index }).toEqual({ file, index: 0 });
    });
  }
});

it('uses shared components for every visible form control and label', () => {
  const remaining = [];
  for (const file of files.filter(file => !file.includes('/components/ui/'))) {
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ['input', 'textarea', 'select', 'label'].includes(node.tagName.getText(sf))) {
        const hidden = node.tagName.getText(sf) === 'input' && node.attributes.properties.some(a => ts.isJsxAttribute(a) && a.name.text === 'type' && a.initializer?.text === 'hidden');
        if (!hidden) remaining.push(path.relative(path.join(__dirname, '..'), file) + ':' + (sf.getLineAndCharacterOfPosition(node.getStart()).line + 1));
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  expect(remaining).toEqual([]);
});

it('keeps form-control appearance centralized and layout overrides static', () => {
  const components = new Set(['Input', 'Textarea', 'NativeSelect', 'Checkbox', 'RadioGroup', 'RadioGroupItem', 'Slider', 'Field', 'FieldLabel', 'Label', 'FieldDescription', 'FieldError', 'InputGroup', 'InputGroupAddon', 'SelectTrigger', 'SelectContent', 'SelectItem', 'SelectValue']);
  const invalid = [];
  for (const file of files.filter(file => !file.includes('/components/ui/'))) {
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && components.has(node.tagName.getText(sf))) {
        for (const attr of node.attributes.properties) if (ts.isJsxAttribute(attr)) {
          if (attr.name.text === 'style') invalid.push(file + ': inline style');
          if (attr.name.text === 'className') {
            if (!attr.initializer || !ts.isStringLiteral(attr.initializer)) invalid.push(file + ': dynamic override');
            else for (const utility of attr.initializer.text.split(/\s+/).filter(Boolean)) if (!/^(?:(?:sm|md|lg|xl):)*(?:flex-1$|(?:w|min-w|max-w|m[trblxy]?)-)/.test(utility)) invalid.push(file + ': ' + utility);
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  expect(invalid).toEqual([]);
});
