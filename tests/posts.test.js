// tests/posts.test.js
const { request, app, registerAndLogin } = require('./testUtils');

describe('Posts', () => {
  const agent = request.agent(app);
  const user = { username: 'poster', email: 'poster@example.com', password: '123456', name: 'Poster' };

  beforeAll(async () => {
    await registerAndLogin(agent, user);
  });

  test('create text post', async () => {
    const res = await agent.post('/posts').send({ content: 'Hello world' }).expect(200);
    expect(res.body.post).toBeDefined();
    expect(res.body.post.content).toBe('Hello world');
  });

  test('get feed returns posts', async () => {
    const res = await agent.get('/posts/feed').expect(200);
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(1);
  });
});
