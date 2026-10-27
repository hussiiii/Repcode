/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

test('every private browser API call uses the shared helper and AI payloads contain no saved key', () => {
  const violations = [];
  let protectedCalls = 0;
  function directory(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) directory(file);
      else if (file.endsWith('.tsx')) {
        const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        function visit(node) {
          if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
            const name = node.expression.text;
            const url = node.arguments[0]?.getText(source) || '';
            if (name === 'fetch' && ((url.includes('/api/') && !url.includes('/api/github-stars')) || url === 'url')) violations.push(file + ': unprotected API request');
            if (name === 'authenticatedFetch') {
              protectedCalls++;
              if (url.includes('/api/openai') && /\bapiKey\s*:/.test(node.getText(source))) violations.push(file + ': AI payload contains a key');
            }
          }
          ts.forEachChild(node, visit);
        }
        visit(source);
      }
    }
  }
  directory(path.join(root, 'src/components'));
  directory(path.join(root, 'src/pages'));
  expect(violations).toEqual([]);
  expect(protectedCalls).toBeGreaterThanOrEqual(50);
});

