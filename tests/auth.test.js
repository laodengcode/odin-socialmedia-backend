// tests/auth.test.js
const { request, app } = require('./testUtils');
const prisma = require('../src/prismaClient');

describe('Auth routes', () => {
  const agent = request.agent(app);
  const user = { username: 'alice', email: 'alice@example.com', password: 'password123', name: 'Alice' };

  test('register -> auto-login', async () => {
    const res = await agent.post('/auth/register').send(user).expect(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
  });

  test('me returns user when logged in', async () => {
    const res = await agent.get('/auth/me').expect(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
  });

  test('logout clears session', async () => {
    await agent.post('/auth/logout').expect(200);
    await agent.get('/auth/me').expect(401);
  });

  test('login works', async () => {
    // login with credentials
    await agent.post('/auth/login').send({ email: user.email, password: user.password }).expect(200);
    const res = await agent.get('/auth/me').expect(200);
    expect(res.body.user.email).toBe(user.email);
  });
});
