/** @jest-environment jsdom */
/* Render representative app states with isolated data and no external-service calls. */
import React from 'react';
const { renderToStaticMarkup } = require('react-dom/server.node');
import fs from 'node:fs';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
const originalChartColors = require('./fixtures/chart-colors.json');
import path from 'node:path';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return { ...actual, useState: (initial: any) => actual.useState(mockInitialState(initial)) };
});

jest.mock('@/firebaseConfig', () => ({ auth: { currentUser: null } }));
jest.mock('firebase/auth', () => ({ signOut: jest.fn() }));
jest.mock('@/auth/AuthContext', () => ({ AuthContext: require('react').createContext({ user: { email: 'palette@example.test', uid: 'fixture' } }) }));
jest.mock('@/auth/useAuth', () => ({ useAuth: () => ({ user: { email: 'palette@example.test', uid: 'fixture' } }) }));
jest.mock('@/auth/SidebarContext', () => ({ useSidebar: () => ({ isExpanded: true, setIsExpanded: jest.fn() }) }));
jest.mock('@/lib/authenticatedFetch', () => ({ authenticatedFetch: jest.fn(() => { throw new Error('Fixture must not call a service'); }) }));
jest.mock('next/router', () => ({ useRouter: () => ({ query: { collectionId: '1', problemId: '1' }, pathname: '/app/main', push: jest.fn(), events: { on: jest.fn(), off: jest.fn() } }) }));
jest.mock('react-query', () => ({ useQuery: (key: any) => ({ data: queryData(key), isLoading: false, refetch: jest.fn() }), useQueryClient: () => ({ invalidateQueries: jest.fn() }), useMutation: () => ({ mutate: jest.fn(), isLoading: false }) }));
jest.mock('@formspree/react', () => ({ useForm: () => [{ succeeded: false, submitting: false, errors: null }, jest.fn()] }));
jest.mock('ace-builds/src-noconflict/theme-one_dark', () => ({}));
jest.mock('ace-builds/src-noconflict/theme-monokai', () => ({}));
jest.mock('ace-builds/src-noconflict/theme-chaos', () => ({}));
jest.mock('ace-builds/src-noconflict/mode-javascript', () => ({}));
jest.mock('ace-builds/src-noconflict/mode-python', () => ({}));
jest.mock('ace-builds/src-noconflict/mode-java', () => ({}));
jest.mock('ace-builds/src-noconflict/mode-c_cpp', () => ({}));
jest.mock('react-ace', () => ({ __esModule: true, default: () => <div data-editor="vendor">Editor fixture</div> }));
jest.mock('react-joyride', () => ({ __esModule: true, default: () => null, STATUS: {} }));
jest.mock('react-markdown', () => ({ __esModule: true, default: ({ children }: any) => <div>{children}</div> }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => {} }));
jest.mock('react-chartjs-2', () => ({ Bar: (props: any) => chartFixture('bar', props), Line: (props: any) => chartFixture('line', props), Scatter: (props: any) => chartFixture('scatter', props), Doughnut: (props: any) => chartFixture('donut', props) }));
jest.mock('chart.js', () => ({ Chart: { register: jest.fn() } }));
jest.mock('chartjs-adapter-date-fns', () => ({}));

const problem = { id: 1, collectionId: 1, name: 'Two Sum', difficulty: 'Easy', type: 'Review', question: '<p>A fixture problem.</p>', solution: 'return []', notes: 'Fixture note', language: 'python', functionSignature: 'def two_sum():', link: 'https://leetcode.com/problems/two-sum/', interval: 1440, ease: 2.5, easeFactor: 2.5, lapses: 1, creationDate: '2026-10-01T00:00:00Z', dueDate: '2026-10-27T12:00:00Z', lastUpdated: '2026-10-26T00:00:00Z', againCount: 1, hardCount: 2, goodCount: 3, easyCount: 4 };
const collections = [{ id: 1, title: 'Algorithms', description: 'Fixture collection', newCount: 1, learningCount: 1, reviewCount: 1, problemCount: 3, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-26T00:00:00Z', problems: [problem] }];
const settings = { membershipType: 'lifetime', learnSteps: '1 10', relearnSteps: '10', graduatingInterval: 1, easyInterval: 4, relearnGraduatingInterval: 1, maximumInterval: 36500, startingEase: 2.5, easyBonus: 1.3, intervalModifier: 1, overdueWarningThreshold: 1, hasApiKey: true, newUser: false, streak: 7 };
function queryData(key: any) {
  const name = Array.isArray(key) ? key[0] : key;
  if (/settings/i.test(name)) return settings;
  if (/collectionDetails/i.test(name) && key.length > 2) return [problem];
  if (/collectionDetails/i.test(name)) return { ...collections[0], problems: [problem] };
  if (/collections/i.test(name)) return collections;
  if (/problemDetails/i.test(name)) return problem;
  if (/problemCount/i.test(name)) return 1;
  if (/problem/i.test(name)) return [problem, { ...problem, id: 2, difficulty: 'Medium', interval: 10080 }, { ...problem, id: 3, difficulty: 'Hard', interval: 40320 }];
  if (/activity/i.test(name)) return { activeDates: ['2026-10-27'], totalActiveDays: 1 };
  return settings;
}
const charts: any[] = [];
function chartFixture(type: string, props: any) { charts.push({ type, ...props }); return <div data-chart={type}>Chart fixture</div>; }
let mockFixtureName = '';
let mockHookIndex = 0;
function mockInitialState(initial: any) {
  const index = mockHookIndex++;
  if (mockFixtureName.startsWith('stats-')) {
    const [, chart, view] = mockFixtureName.split('-');
    return initial === 'collection' ? chart : initial === 'grouped' ? view : initial;
  }
  if (mockFixtureName.startsWith('queue-')) {
    if (index === 0) return [problem];
    if (index === 1) return ['Again','Hard','Good','Easy'].map(label => ({ label, value: label.toLowerCase() }));
    if (initial === 'question') return mockFixtureName.slice('queue-'.length);
  }
  return initial;
}
const noop = () => {};
const cases: [string, any][] = [
  ['collections', require('@/components/app/CollectionCards').default],
  ['collection-modal', () => React.createElement(require('@/components/app/CollectionModal').default, { isOpen: true, onClose: noop, showToast: noop })],
  ['problem-modal', () => React.createElement(require('@/components/app/ProblemModal').default, { isOpen: true, isEditMode: true, problemToEdit: problem, collectionId: 1, onClose: noop })],
  ['problem-stats', () => React.createElement(require('@/components/app/ProblemStatsModal').default, { isOpen: true, onClose: noop, problem })],
  ['random-problem', () => React.createElement(require('@/components/app/RandomProblemModal').default, { isOpen: true, onClose: noop })],
  ['import', () => React.createElement(require('@/components/app/ImportModal').default, { isOpen: true, onClose: noop, collectionId: 1 })],
  ['report-bug', () => React.createElement(require('@/components/app/ReportBugModal').default, { isOpen: true, onClose: noop })],
  ['onboarding', () => React.createElement(require('@/components/app/FirstTimeLogin').default, { isOpen: true, onClose: noop })],
  ['settings', require('@/components/app/Settings').default],
  ['profile', require('@/components/app/Profile').default],
  ['sidebar', require('@/components/app/SideBar').default],
  ['problem-list', () => React.createElement(require('@/components/app/ProblemsList').default, { collectionId: 1 })],
  ['problem', () => React.createElement(require('@/components/app/Problem').default, { problem, contentActive: 'question', setContentActive: noop, editorContent: '', setEditorContent: noop })],
  ['study-queue', () => React.createElement(require('@/components/app/ProblemsQueue').default, { problems: [problem], userSettings: settings, refetchProblems: noop })],
  ...['question','notes','solution','whiteboard'].map(tab => [`queue-${tab}`, () => React.createElement(require('@/components/app/ProblemsQueue').default, { problems: [problem], userSettings: settings, refetchProblems: noop })] as [string,any]),
  ['calendar', () => React.createElement(require('@/components/app/StreakCalendar').default, { currentYear: 2026 })],
  ['whiteboard', require('@/components/app/WhiteBoard').Whiteboard],
  ['chat', () => React.createElement(require('@/components/app/ChatWindow').default, { problem, editorContent: '', hasApiKey: true, externalMessages: [{ sender: 'assistant', text: 'Fixture response' }], externalIsAnalyzing: false })],
  ['week-chart', require('@/components/app/BarGraphWeek').default],
  ['month-chart', require('@/components/app/BarGraphMonth').default],
  ...['creationDate','interval','lapses','collection','totalFeedback','dueDate'].flatMap(chart => ['grouped','individual'].map(view => [`stats-${chart}-${view}`, require('@/components/app/StatsCharts').default] as [string,any])),
];

beforeAll(() => {
  jest.useFakeTimers({ now: new Date('2026-10-27T12:00:00Z') });
  // CSS custom properties are loaded explicitly because next/jest stubs CSS imports.
  const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const declarations = css.match(/:root\s*\{([\s\S]*?)\n  \}/)?.[1] || '';
  const style = document.createElement('style'); style.textContent = `:root {${declarations}}`; document.head.append(style);
});
afterAll(() => jest.useRealTimers());

test.each(cases)('%s fixture', (name, Component) => {
  charts.length = 0;
  mockFixtureName = name;
  mockHookIndex = 0;
  const html = renderToStaticMarkup(<Component />);
  expect(html.length).toBeGreaterThan(100);
  expect(authenticatedFetch).not.toHaveBeenCalled();
  if (name.startsWith('queue-')) expect(html).toContain('Two Sum');
  if (name.startsWith('stats-')) {
    const [, chart, view] = name.split('-');
    const expectedType = chart === 'creationDate' || view === 'individual' ? 'scatter' : chart === 'lapses' ? 'donut' : 'bar';
    expect(charts[0]?.type).toBe(expectedType);
  }
  const expected = originalChartColors[name] || {};
  expect(colorSnapshot(charts)).toEqual(expected);
});

function normalizeColor(value: string): string {
  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = hex.split('').map(c => c + c).join('');
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16))
      .concat(hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1).join(',');
  }
  const match = value.match(/^rgba?\(([^)]+)\)$/);
  if (match) {
    const numbers = match[1].split(',').map(Number);
    return (numbers.length === 3 ? [...numbers, 1] : numbers).join(',');
  }
  return value.replace(/\s+/g, '');
}

function colorSnapshot(value: any, prefix = '', result: Record<string, string> = {}) {
  if (typeof value === 'string' && /^(?:#[\da-f]{3,8}$|rgba?\(|hsla?\()/i.test(value)) result[prefix] = normalizeColor(value);
  else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) colorSnapshot(child, prefix ? prefix + '.' + key : key, result);
  return result;
}
