/* eslint-env jest */
const fs = require('node:fs');
const path = require('node:path');
const { apiHarness } = require('./helpers/api-harness');
const root = path.resolve(__dirname, '..');

const privateRoutes = {
  createUser: 'POST', createCollection: 'POST', createProblem: 'POST',
  deleteCollection: 'DELETE', deleteProblem: 'DELETE',
  getActivityDays: 'GET', getAllProblemsFromUser: 'GET', getCollectionDetails: 'GET',
  getCollectionProblems: 'GET', getProblemDetails: 'GET', getUserCollections: 'GET',
  getUserSettings: 'GET', getUserStatus: 'GET', importFromLeetcode: 'POST',
  manualLapse: 'POST', moveProblem: 'POST', openai: 'POST', updateCollection: 'PUT',
  updateCollectionCounts: 'POST', updateContribution: 'POST', updateNewUserStatus: 'PUT',
  updateProblem: 'PUT', updateProblemForAlgo: 'POST', updateStreak: 'POST', updateUserSettings: 'PUT',
};
const problemBody = { name: 'Two Sum', question: 'Find two numbers', solution: 'return []', difficulty: 'Easy', collectionId: 10, functionSignature: 'def solve():', language: 'python', link: '', notes: '' };

// New API files must be deliberately classified, rather than silently missing the guard checks.
test('every API route has an explicit access classification', () => {
  const actual = fs.readdirSync(path.join(root, 'src/pages/api')).filter(f => f.endsWith('.ts')).map(f => f.slice(0, -3)).sort();
  expect(actual).toStrictEqual([...Object.keys(privateRoutes), 'deleteUser', 'github-stars'].sort());
});

for (const [route, method] of Object.entries(privateRoutes)) {
  test(`${route}: missing, expired, and unverified credentials cannot reach data`, async () => {
    for (const [token, expected] of [[null, 401], ['expired', 401], ['unverified', 403], ['no-email', 403]]) {
      const h = apiHarness();
      const res = await h.request(route, { method, token });
      expect(res.statusCode).toBe(expected);
      expect(h.calls.length).toBe(0);
      expect(res.headers['Cache-Control']).toBe('private, no-store');
    }
  });
}

test('cookie-only and malformed authorization cannot authenticate an API request', async () => {
  for (const headers of [{ cookie: 'token=alice' }, { authorization: 'Bearer' }, { authorization: ['Bearer alice'] }, { authorization: 'Bearer alice extra' }]) {
    const h = apiHarness();
    const res = await h.request('getUserSettings', { token: null, headers });
    expect(res.statusCode).toBe(401);
    expect(h.calls.length).toBe(0);
  }
});

test('method restrictions are enforced without provisioning or modifying data', async () => {
  for (const [route, method] of Object.entries(privateRoutes)) {
    const h = apiHarness();
    const res = await h.request(route, { method: 'PATCH' });
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toStrictEqual([method]);
    expect(h.calls.length).toBe(0);
  }
});

test('user reads ignore spoofed email and user IDs and never return saved keys', async () => {
  for (const route of ['getUserSettings', 'getUserCollections', 'getAllProblemsFromUser', 'getUserStatus', 'getActivityDays']) {
    const h = apiHarness();
    const res = await h.request(route, { query: { userEmail: 'bob@example.test', userId: '2', year: '2026' } });
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toMatch(/private-|Bob|bob@example/);
    if (route === 'getUserSettings') {
      expect(res.body.id).toBe(1);
      expect(res.body.hasApiKey).toBe(true);
      expect(Object.hasOwn(res.body, 'apiKey')).toBe(false);
    }
    if (route === 'getUserCollections') expect(res.body.map(c => c.id)).toStrictEqual([10, 11]);
    if (route === 'getAllProblemsFromUser') expect(res.body.map(p => p.id)).toStrictEqual([100]);
    if (route === 'getActivityDays') expect(res.body.activeDates).toStrictEqual(['2026-01-01']);
  }
});

for (const [route, method, query, body] of [
  ['getCollectionDetails', 'GET', { collectionId: '20' }, {}],
  ['getCollectionProblems', 'GET', { collectionId: '20', userId: '2' }, {}],
  ['getProblemDetails', 'GET', { problemId: '200', userId: '2' }, {}],
  ['updateCollection', 'PUT', { collectionId: '20' }, { title: 'Taken over', userEmail: 'alice@example.test' }],
  ['deleteCollection', 'DELETE', { collectionId: '20' }, {}],
  ['deleteProblem', 'DELETE', { problemId: '200' }, {}],
  ['updateProblem', 'PUT', { problemId: '200' }, problemBody],
  ['createProblem', 'POST', {}, { ...problemBody, collectionId: 20 }],
  ['updateProblemForAlgo', 'POST', {}, { id: 200, updates: { dueDate: '2026-02-01T12:00:00Z' } }],
  ['manualLapse', 'POST', {}, { problemId: 200 }],
  ['updateCollectionCounts', 'POST', {}, { collectionId: 20 }],
  ['importFromLeetcode', 'POST', {}, { slug: 'favorite-list', collectionId: 20 }],
  ['moveProblem', 'POST', {}, { problemId: 100, targetCollectionId: 20 }],
  ['moveProblem', 'POST', {}, { problemId: 200, targetCollectionId: 10 }],
  ['updateProblem', 'PUT', { problemId: '100' }, { ...problemBody, collectionId: 20 }],
]) {
  test(`${route}: another user's resource cannot be read, edited, deleted, or used as a destination`, async () => {
    const h = apiHarness();
    const res = await h.request(route, { method, query, body });
    expect(res.statusCode).toBe(404);
    expect(h.writes()).toStrictEqual([]);
  });
}

test('owned collection/problem reads work without client-supplied ownership IDs', async () => {
  for (const [route, query] of [['getCollectionDetails', { collectionId: '10' }], ['getCollectionProblems', { collectionId: '10' }], ['getProblemDetails', { problemId: '100' }]]) {
    const h = apiHarness();
    const res = await h.request(route, { query });
    expect(res.statusCode).toBe(200);
  }
});

test('collection creation and renaming cannot assign or transfer ownership', async () => {
  const h = apiHarness();
  const created = await h.request('createCollection', { method: 'POST', body: { title: 'New', userEmail: 'bob@example.test', userId: 2 } });
  expect(created.statusCode).toBe(200);
  expect(created.body.userId).toBe(1);
  const renamed = await h.request('updateCollection', { method: 'PUT', query: { collectionId: '10' }, body: { title: 'Renamed', userEmail: 'bob@example.test', userId: 2 } });
  expect(renamed.statusCode).toBe(200);
  expect(renamed.body.userId).toBe(1);
  expect(h.collections.find(c => c.id === 20).title).toBe('Bob');
});

test('problem creation/editing, moving, and count updates still work for their owner', async () => {
  const h = apiHarness();
  const created = await h.request('createProblem', { method: 'POST', body: problemBody });
  expect(created.statusCode).toBe(200);
  expect(created.body.collectionId).toBe(10);
  expect(created.body.dueDate.getTime()).toBe(created.body.originalDueDate.getTime());
  const edited = await h.request('updateProblem', { method: 'PUT', query: { problemId: '100' }, body: { ...problemBody, name: 'Edited' } });
  expect(edited.statusCode).toBe(200);
  const moved = await h.request('moveProblem', { method: 'POST', body: { problemId: 100, targetCollectionId: 11 } });
  expect(moved.statusCode).toBe(200);
  expect(moved.body.collectionId).toBe(11);
  const counts = await h.request('updateCollectionCounts', { method: 'POST', body: { collectionId: 11 } });
  expect(counts.statusCode).toBe(200);
  expect(h.collections.find(c => c.id === 11).reviewCount).toBe(1);
});

test('deleting an owned collection removes only that collection and its problems', async () => {
  const h = apiHarness();
  const res = await h.request('deleteCollection', { method: 'DELETE', query: { collectionId: '10' } });
  expect(res.statusCode).toBe(200);
  expect(h.problems.some(p => p.id === 100)).toBe(false);
  expect(h.problems.some(p => p.id === 200)).toBe(true);
  expect(h.collections.some(c => c.id === 20)).toBe(true);
  expect(h.calls.some(c => c.name === '$transaction')).toBe(true);
});

test('settings updates are bound to the verified user; privileged and nested fields are rejected', async () => {
  const h = apiHarness();
  const own = await h.request('updateUserSettings', { method: 'PUT', body: { userEmail: 'bob@example.test', settings: { learnSteps: '5m 2d' } } });
  expect(own.statusCode).toBe(200);
  expect(h.users[0].learnSteps).toBe('5m 2d');
  expect(h.users[1].learnSteps).toBe(undefined);
  for (const settings of [{ membershipType: 'lifetime' }, { email: 'bob@example.test' }, { collections: { deleteMany: {} } }, { apiKey: { set: 'stolen' } }, { currentStreak: 999 }]) {
    const isolated = apiHarness();
    const res = await isolated.request('updateUserSettings', { method: 'PUT', body: { settings } });
    expect(res.statusCode).toBe(400);
    expect(isolated.writes()).toStrictEqual([]);
  }
});

test('saving unrelated settings preserves the saved AI key; replacement and removal stay private', async () => {
  const h = apiHarness();
  for (const settings of [{ easyBonus: 1.4 }, { apiKey: 'replacement-private-key' }, { apiKey: null }]) {
    const res = await h.request('updateUserSettings', { method: 'PUT', body: { settings } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({ success: true });
    if (!Object.hasOwn(settings, 'apiKey')) expect(h.users[0].apiKey).toBe('private-alice-key');
  }
  const res = await h.request('getUserSettings');
  expect(res.body.hasApiKey).toBe(false);
  expect(Object.hasOwn(res.body, 'apiKey')).toBe(false);
});

test('review updates preserve skip semantics and accept fractional algorithm intervals', async () => {
  const h = apiHarness();
  const originalDueDate = h.problems[0].originalDueDate.getTime();
  const skipped = await h.request('updateProblemForAlgo', { method: 'POST', body: { id: 100, updates: { dueDate: '2026-02-02T12:00:00Z' } } });
  expect(skipped.statusCode).toBe(200);
  expect(skipped.body.originalDueDate.getTime()).toBe(originalDueDate);
  const reviewed = await h.request('updateProblemForAlgo', { method: 'POST', body: { id: 100, updates: { type: 'Review', interval: 3600.25, ease: 2.5, goodCount: 1, dueDate: '2026-03-01T12:00:00Z', originalDueDate: '2026-03-01T12:00:00Z' } } });
  expect(reviewed.statusCode).toBe(200);
  expect(reviewed.body.interval).toBe(3600);
  expect(reviewed.body.goodCount).toBe(1);
  for (const updates of [{ collectionId: 20 }, { collection: { connect: { id: 20 } } }, { solution: 'overwrite' }, { interval: -10 }, { dueDate: 'invalid' }]) {
    const isolated = apiHarness();
    const res = await isolated.request('updateProblemForAlgo', { method: 'POST', body: { id: 100, updates } });
    expect(res.statusCode).toBe(400);
    expect(isolated.writes()).toStrictEqual([]);
  }
});

test('manual lapse still applies the owner\'s relearning settings', async () => {
  const h = apiHarness();
  const res = await h.request('manualLapse', { method: 'POST', body: { problemId: 100 } });
  expect(res.statusCode).toBe(200);
  expect(res.body.type).toBe('Relearning');
  expect(res.body.interval).toBe(10);
  expect(res.body.relearnInterval).toBe(1440);
  expect(res.body.lapses).toBe(1);
  expect(res.body.ease).toBe(2.3);
});

test('activity and onboarding updates cannot target another account', async () => {
  for (const [route, method, body] of [['updateStreak', 'POST', { userEmail: 'bob@example.test', localDate: '2026-01-02' }], ['updateContribution', 'POST', { userEmail: 'bob@example.test' }], ['updateNewUserStatus', 'PUT', { userEmail: 'bob@example.test' }]]) {
    const h = apiHarness();
    const before = structuredClone(h.users[1]);
    const res = await h.request(route, { method, body });
    expect(res.statusCode).toBe(200);
    expect(h.users[1]).toStrictEqual(before);
    expect(h.writes().every(call => call.name === 'activityDay.upsert' ? call.args.create.userId === 1 : call.args.where.id === 1)).toBeTruthy();
  }
});

test('bad IDs, malformed settings, and impossible dates produce validation errors', async () => {
  for (const id of ['10junk', '0', '-1', ['10', '20'], null]) {
    const h = apiHarness();
    const res = await h.request('getCollectionDetails', { query: { collectionId: id } });
    expect(res.statusCode).toBe(400);
  }
  const h = apiHarness();
  const res = await h.request('updateStreak', { method: 'POST', body: { localDate: '2026-02-30' } });
  expect(res.statusCode).toBe(400);
  expect(h.writes()).toStrictEqual([]);
});

test('new and returning sign-ins provision exactly one account without resetting existing data', async () => {
  const h = apiHarness();
  const existing = structuredClone(h.users[0]);
  for (const token of ['alice', 'alice', 'new', 'new']) {
    const res = await h.request('createUser', { method: 'POST', token, body: { email: 'bob@example.test', membershipType: 'pro' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(token === 'alice' ? 'alice@example.test' : 'new@example.test');
    expect(Object.hasOwn(res.body, 'apiKey')).toBe(false);
  }
  expect(h.users[0]).toStrictEqual(existing);
  expect(h.users.filter(u => u.email === 'new@example.test').length).toBe(1);
  expect(h.users.find(u => u.email === 'new@example.test').membershipType).toBe('lifetime');
});

test('a concurrent first-login insert race resolves to the existing account', async () => {
  const h = apiHarness();
  h.prisma.user.upsert = async () => { throw Object.assign(new Error('duplicate email'), { code: 'P2002' }); };
  const res = await h.request('createUser', { method: 'POST' });
  expect(res.statusCode).toBe(200);
  expect(res.body.id).toBe(1);
});

test('AI uses the authenticated owner\'s stored key and never a supplied credential', async () => {
  const h = apiHarness();
  const body = { question: 'Question', solution: 'Expected', userSolution: 'My code', userMessage: 'Help', apiKey: 'attacker-supplied-key', userEmail: 'bob@example.test' };
  const res = await h.request('openai', { method: 'POST', body });
  expect(res.statusCode).toBe(200);
  expect(h.modelCalls).toStrictEqual([{ apiKey: 'private-alice-key' }]);
  expect(JSON.stringify(res.body)).not.toMatch(/private-|attacker/);
  const analyze = await h.request('openai', { method: 'POST', body: { ...body, mode: 'analyze' } });
  expect(analyze.statusCode).toBe(200);
  expect(h.modelCalls.length).toBe(1);
  h.users[0].apiKey = null;
  const missing = await h.request('openai', { method: 'POST', body });
  expect(missing.statusCode).toBe(400);
  expect(h.modelCalls.length).toBe(1);
});

test('administrative deletion fails closed when its secret is absent or incorrect', async () => {
  jest.replaceProperty(process, 'env', { ...process.env });
  delete process.env.DELETE_USER_API_KEY;
  let h = apiHarness();
  let res = await h.request('deleteUser', { method: 'DELETE', token: null, body: { email: 'bob@example.test' } });
  expect(res.statusCode).toBe(403);
  expect(h.calls.length).toBe(0);
  process.env.DELETE_USER_API_KEY = 'configured-admin-secret';
  for (const supplied of [undefined, 'wrong', ['configured-admin-secret']]) {
    h = apiHarness();
    res = await h.request('deleteUser', { method: 'DELETE', token: null, headers: { 'x-api-key': supplied }, body: { email: 'bob@example.test' } });
    expect(res.statusCode).toBe(403);
    expect(h.calls.length).toBe(0);
  }
});

test('owned LeetCode imports still fetch details and create scheduled problems', async () => {
  const h = apiHarness();
  const external = [];
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    expect(url).toBe('https://leetcode.com/graphql');
    expect(init.headers.Authorization).toBe(undefined);
    external.push(JSON.parse(init.body));
    const body = external.length === 1
      ? { data: { favoriteQuestionList: { questions: [{ titleSlug: 'two-sum' }] } } }
      : { data: { question: { title: 'Two Sum', difficulty: 'Easy', questionFrontendId: '1', content: '<p>Question</p>', codeDefinition: JSON.stringify([{ value: 'python3', defaultCode: 'def solve(): pass' }]) } } };
    return new Response(JSON.stringify(body), { status: 200 });
  });
  const res = await h.request('importFromLeetcode', { method: 'POST', body: { slug: 'favorite-list', collectionId: '10' } });
  expect(res.statusCode).toBe(200);
  expect(external.length).toBe(2);
  expect(res.body.problems.length).toBe(1);
  expect(res.body.problems[0].collectionId).toBe(10);
  expect(res.body.problems[0].functionSignature).toBe('def solve(): pass');
  expect(res.body.problems[0].dueDate.getTime()).toBe(res.body.problems[0].originalDueDate.getTime());
});

test('asynchronous handler failures are awaited and do not disclose database errors', async () => {
  const h = apiHarness();
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  h.prisma.problem.update = async () => {
    await new Promise(resolve => setImmediate(resolve));
    throw new Error('database credentials and private-alice-key');
  };
  const res = await h.request('updateProblemForAlgo', { method: 'POST', body: { id: 100, updates: { dueDate: '2026-03-01T12:00:00Z' } } });
  expect(res.statusCode).toBe(500);
  expect(res.body).toStrictEqual({ error: 'Unable to complete the request' });
});

test('provider errors cannot reveal a saved AI credential', async () => {
  const h = apiHarness();
  h.modelRequests.push = () => { throw new Error('Invalid credential: private-alice-key'); };
  const res = await h.request('openai', { method: 'POST', body: { question: 'Q', solution: 'S', userSolution: 'U', userMessage: 'Help' } });
  expect(res.statusCode).toBe(502);
  expect(JSON.stringify(res.body)).not.toMatch(/private-alice-key|Invalid credential/);
});

test('an authenticated account missing its database row gets a controlled sign-in error', async () => {
  const h = apiHarness();
  const res = await h.request('getUserSettings', { token: 'new' });
  expect(res.statusCode).toBe(404);
  expect(h.writes()).toStrictEqual([]);
});

test('the administrative deletion key still permits its intended operation without returning credentials', async () => {
  jest.replaceProperty(process, 'env', { ...process.env });
  process.env.DELETE_USER_API_KEY = 'configured-admin-secret';
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  const h = apiHarness();
  const res = await h.request('deleteUser', { method: 'DELETE', token: null, headers: { 'x-api-key': 'configured-admin-secret' }, body: { email: 'bob@example.test' } });
  expect(res.statusCode).toBe(200);
  expect(res.body.deletedUser).toStrictEqual({ id: 2, email: 'bob@example.test' });
  expect(h.users.some(user => user.id === 2)).toBe(false);
  expect(h.users.some(user => user.id === 1)).toBe(true);
  expect(JSON.stringify(res.body)).not.toMatch(/private-|apiKey/);
});
