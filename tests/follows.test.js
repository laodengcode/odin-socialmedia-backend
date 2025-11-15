// tests/follows.test.js
const { request, app, registerAndLogin } = require('./testUtils');
const prisma = require('../src/prismaClient');

describe('Follows', () => {
  const aliceAgent = request.agent(app);
  const bobAgent = request.agent(app);

  let alice;
  let bob;

  beforeAll(async () => {
    await registerAndLogin(aliceAgent, { username: 'alice2', email: 'alice2@example.com', password: 'pass' });
    alice = await prisma.user.findUnique({ where: { email: 'alice2@example.com' } });
    const res2 = await bobAgent.post('/auth/register').send({ username: 'bob2', email: 'bob2@example.com', password: 'pass' });
    bob = res2.body.user;
  });

  test('send follow request', async () => {
    const res = await aliceAgent.post(`/follows/${bob.id}`).expect(200);
    expect(res.body.follow).toBeDefined();
    expect(res.body.follow.status).toBe('PENDING');
  });

  test('bob accept follow', async () => {
    // find follow entry
    const followEntry = await prisma.follow.findFirst({ where: { followerId: alice.id } });
    // bob logs in
    await bobAgent.post('/auth/login').send({ email: 'bob2@example.com', password: 'pass' }).expect(200);
    const res = await bobAgent.patch(`/follows/${followEntry.id}/accept`).expect(200);
    expect(res.body.follow).toBeDefined();
    expect(res.body.follow.status).toBe('ACCEPTED');
  });
});
