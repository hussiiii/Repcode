const { jest: jestRunner } = require('@jest/globals');

function apiHarness() {
  const users = [
    { id: 1, email: 'alice@example.test', apiKey: 'private-alice-key', membershipType: 'lifetime', newUser: false, learnSteps: '10m 1d', relearnSteps: '10m', minimumEase: 1.3, maximumInterval: 180, graduatingInterval: 3, currentStreak: 4, longestStreak: 8, lastStreakDate: '2026-01-01', contributionHistory: {} },
    { id: 2, email: 'bob@example.test', apiKey: 'private-bob-key', membershipType: 'free', newUser: true, currentStreak: 9, longestStreak: 10, contributionHistory: {} },
  ];
  const collections = [
    { id: 10, userId: 1, title: 'Alice', lastAdded: null },
    { id: 11, userId: 1, title: 'Alice second', lastAdded: null },
    { id: 20, userId: 2, title: 'Bob', lastAdded: null },
  ];
  const problems = [
    { id: 100, collectionId: 10, name: 'Alice problem', type: 'Review', interval: 1440, relearnInterval: 0, ease: 2.5, lapses: 0, againCount: 0, hardCount: 0, goodCount: 0, easyCount: 0, dueDate: new Date('2026-01-02T12:00:00Z'), originalDueDate: new Date('2026-01-01T12:00:00Z') },
    { id: 200, collectionId: 20, name: 'Bob problem', type: 'Review', interval: 1440, ease: 2.5, lapses: 0, againCount: 0 },
  ];
  const days = [{ userId: 1, date: new Date('2026-01-01T00:00:00Z') }, { userId: 2, date: new Date('2026-01-02T00:00:00Z') }];
  const calls = [], verifyCalls = [], modelCalls = [], modelRequests = [];
  const project = (row, select) => !row ? null : select ? Object.fromEntries(Object.keys(select).filter(key => select[key]).map(key => [key, row[key]])) : { ...row };
  const notFound = () => Object.assign(new Error('not found'), { code: 'P2025' });
  const userMatches = (row, where = {}) => (where.id === undefined || row.id === where.id) && (where.email === undefined || row.email === where.email);
  const collectionMatches = (row, where = {}) => (where.id === undefined || row.id === where.id) && (where.userId === undefined || row.userId === where.userId);
  const problemMatches = (row, where = {}) => (where.id === undefined || row.id === where.id) && (where.collectionId === undefined || row.collectionId === where.collectionId) && (where.collection?.userId === undefined || collections.find(c => c.id === row.collectionId)?.userId === where.collection.userId);
  function logged(name, implementation) {
    return jestRunner.fn(async args => { calls.push({ name, args: structuredClone(args) }); return implementation(args); });
  }
  function update(rows, matches, args) {
    const row = rows.find(row => matches(row, args.where));
    if (!row) throw notFound();
    Object.assign(row, args.data);
    return project(row, args.select);
  }
  const prisma = {
    user: {
      findUnique: logged('user.findUnique', args => project(users.find(u => userMatches(u, args.where)), args.select)),
      findUniqueOrThrow: logged('user.findUniqueOrThrow', args => { const row = users.find(u => userMatches(u, args.where)); if (!row) throw notFound(); return project(row, args.select); }),
      upsert: logged('user.upsert', args => { let row = users.find(u => userMatches(u, args.where)); if (!row) { row = { id: users.length + 1, newUser: true, membershipType: 'lifetime', ...args.create }; users.push(row); } else Object.assign(row, args.update); return project(row, args.select); }),
      update: logged('user.update', args => update(users, userMatches, args)),
      delete: logged('user.delete', args => { const index = users.findIndex(u => userMatches(u, args.where)); if (index < 0) throw notFound(); return project(users.splice(index, 1)[0], args.select); }),
    },
    collection: {
      findFirst: logged('collection.findFirst', args => project(collections.find(c => collectionMatches(c, args.where)), args.select)),
      findMany: logged('collection.findMany', args => collections.filter(c => collectionMatches(c, args.where)).map(c => project(c, args.select))),
      create: logged('collection.create', args => { const row = { id: 30 + collections.length, ...args.data }; collections.push(row); return project(row, args.select); }),
      update: logged('collection.update', args => update(collections, collectionMatches, args)),
      delete: logged('collection.delete', args => { const index = collections.findIndex(c => collectionMatches(c, args.where)); if (index < 0) throw notFound(); return collections.splice(index, 1)[0]; }),
      deleteMany: logged('collection.deleteMany', args => { const matches = collections.filter(c => collectionMatches(c, args.where)); for (const row of matches) collections.splice(collections.indexOf(row), 1); return { count: matches.length }; }),
    },
    problem: {
      findFirst: logged('problem.findFirst', args => project(problems.find(p => problemMatches(p, args.where)), args.select)),
      findMany: logged('problem.findMany', args => problems.filter(p => problemMatches(p, args.where)).map(p => project(p, args.select))),
      count: logged('problem.count', args => problems.filter(p => problemMatches(p, args.where)).length),
      create: logged('problem.create', args => { const row = { id: 300 + problems.length, ...args.data }; problems.push(row); return project(row, args.select); }),
      update: logged('problem.update', args => update(problems, problemMatches, args)),
      delete: logged('problem.delete', args => { const index = problems.findIndex(p => problemMatches(p, args.where)); if (index < 0) throw notFound(); return problems.splice(index, 1)[0]; }),
      deleteMany: logged('problem.deleteMany', args => { const matches = problems.filter(p => problemMatches(p, args.where)); for (const row of matches) problems.splice(problems.indexOf(row), 1); return { count: matches.length }; }),
    },
    activityDay: {
      findMany: logged('activityDay.findMany', args => days.filter(day => day.userId === args.where.userId && day.date >= args.where.date.gte && day.date < args.where.date.lt).map(day => ({ date: day.date }))),
      upsert: logged('activityDay.upsert', args => { days.push(args.create); return args.create; }),
    },
  };
  prisma.$transaction = async operation => { calls.push({ name: '$transaction' }); return operation(prisma); };
  const admin = { auth: () => ({
    verifyIdToken: async token => {
      verifyCalls.push(token);
      if (token === 'expired') throw new Error('expired');
      if (token === 'unverified') return { uid: 'unverified', email: 'alice@example.test', email_verified: false };
      if (token === 'no-email') return { uid: 'no-email', email_verified: true };
      const email = token === 'bob' ? 'bob@example.test' : token === 'new' ? 'new@example.test' : 'alice@example.test';
      return { uid: token, email, email_verified: true };
    },
    getUserByEmail: async () => ({ uid: 'deleted-firebase-user' }),
    deleteUser: async () => undefined,
  }) };
  class OpenAI {
    constructor(options) {
      modelCalls.push(options);
      this.chat = { completions: { create: async request => { modelRequests.push(request); return { choices: [{ message: { content: 'Helpful answer' } }] }; } } };
    }
  }
  async function request(route, { method = 'GET', token = 'alice', headers = {}, query = {}, body = {} } = {}) {
    const response = {
      statusCode: 200, headers: {}, body: undefined,
      setHeader(name, value) { this.headers[name] = value; return this; },
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
      end(body) { this.body = body; return this; },
    };
    const req = { method, url: '/api/' + route, headers: { ...(token === null ? {} : { authorization: 'Bearer ' + token }), ...headers }, query, body };
    let handler;
    jestRunner.isolateModules(() => {
      jestRunner.doMock('../../prisma_client', () => ({ __esModule: true, default: prisma }));
      jestRunner.doMock('../../firebaseAdmin', () => ({ __esModule: true, default: admin }));
      jestRunner.doMock('openai', () => ({ __esModule: true, default: OpenAI }));
      handler = require('../../src/pages/api/' + route).default;
    });
    await handler(req, response);
    return response;
  }
  const writes = () => calls.filter(call => /\.(create|update|delete|upsert)/.test(call.name));
  return { request, prisma, users, collections, problems, days, calls, verifyCalls, modelCalls, modelRequests, writes };
}
module.exports = { apiHarness };
