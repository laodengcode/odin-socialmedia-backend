// tests/users.test.js
const { request, app, registerAndLogin } = require('./testUtils');

describe('Users endpoints', () => {
  const agent = request.agent(app);
  const user = { username: 'u1', email: 'u1@example.com', password: 'p' };

  beforeAll(async () => {
    await registerAndLogin(agent, user);
  });

  test('list users', async () => {
    const res = await agent.get('/users').expect(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  test('get own profile', async () => {
    // get /auth/me to fetch id
    const me = await agent.get('/auth/me').expect(200);
    const id = me.body.user.id;
    const res = await agent.get(`/users/${id}`).expect(200);
    expect(res.body.user.id).toBe(id);
  });

  test('update profile', async () => {
    const res = await agent.patch('/users/me').send({ name: 'NewName', bio: 'hi' }).expect(200);
    expect(res.body.user.name).toBe('NewName');
    expect(res.body.user.bio).toBe('hi');
  });
});
