/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.join(__dirname, '..');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const files = walk(path.join(root, 'src')).filter(file => file.endsWith('.tsx') && !file.includes('/components/ui/'));

it('uses the shared table and media structures for every active caller', () => {
  const remaining = [];
  for (const file of files) {
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(sf);
        if (['table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary'].includes(tag)) remaining.push(file + ': ' + tag);
        if (['iframe', 'video'].includes(tag)) {
          let parent = node.parent;
          while (parent && !(ts.isJsxElement(parent) && parent.openingElement.tagName.getText(sf) === 'MediaFrame')) parent = parent.parent;
          if (!parent) remaining.push(file + ': unframed media');
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  expect(remaining).toEqual([]);
});

it('routes every application and public content page through its shared shell', () => {
  const pages = walk(path.join(root, 'src/pages/app')).filter(file => file.endsWith('.tsx'));
  for (const file of pages) {
    const content = fs.readFileSync(file, 'utf8');
    expect(content).toContain('<AppShell');
    expect(content).not.toMatch(/<SideBar|<main/);
  }
  expect(fs.readFileSync(path.join(root, 'src/pages/login.tsx'), 'utf8')).toContain('<AuthShell');
  for (const page of ['index', 'guide', 'changelog', 'privacy', 'terms']) {
    const content = fs.readFileSync(path.join(root, 'src/pages', page + '.tsx'), 'utf8');
    expect(content).toContain('<PublicShell');
    expect(content).not.toMatch(/<NavBar|<Footer|<main/);
  }
});

it('removes superseded wrappers and hidden triggers, and shares problem formatting', () => {
  const pkg = require('../package.json');
  expect(pkg.dependencies.konva).toBeUndefined();
  expect(pkg.dependencies['react-konva']).toBeUndefined();
  for (const name of ['app/SketchModal', 'app/Carousel', 'app/ReportBugButton', 'app/Toast', 'home/BackgroundDots', 'home/MoreInfo']) expect(fs.existsSync(path.join(root, 'src/components', name + '.tsx'))).toBe(false);
  for (const file of files) expect(fs.readFileSync(file, 'utf8')).not.toContain('add-collection-button');
  for (const name of ['Problem', 'ProblemsQueue']) {
    const content = fs.readFileSync(path.join(root, 'src/components/app', name + '.tsx'), 'utf8');
    expect(content).toContain('formatProblemContent');
    expect(content).toContain('<Prose');
    expect(content).not.toMatch(/sanitizeCodeBlocks|preBlockStyles/);
  }
});

it('keeps generic badges free of problem rules and prevents custom clickable disclosures', () => {
  const badge = fs.readFileSync(path.join(root, 'src/components/ui/Badge.tsx'), 'utf8');
  expect(badge).not.toMatch(/difficulty|problemType|study-|lucide-react/);
  const violations = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(sf);
        if (tag === 'div' && node.attributes.properties.some(attr => ts.isJsxAttribute(attr) && attr.name.text === 'onClick')) violations.push(file + ': clickable div');
        if (tag === 'Badge' && node.attributes.properties.some(attr => ts.isJsxAttribute(attr) && attr.name.text === 'type')) violations.push(file + ': domain Badge');
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  expect(violations).toEqual([]);
  const modal = fs.readFileSync(path.join(root, 'src/components/app/ProblemModal.tsx'), 'utf8');
  expect(modal).toContain('<CollapsibleTrigger');
  expect(modal).toContain('<CollapsibleContent');
  expect(modal).not.toContain('max-h-0 opacity-0');
});
