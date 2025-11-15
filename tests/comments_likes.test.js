// tests/comments_likes.test.js
const { request, app, registerAndLogin } = require('./testUtils');

describe('Comments and Likes', () => {
  const agent = request.agent(app);
  const user = { username: 'cuser', email: 'cuser@example.com', password: 'pass' };
  let postId;

  beforeAll(async () => {
    await registerAndLogin(agent, user);
    const p = await agent.post('/posts').send({ content: 'Post for comments' }).expect(200);
    postId = p.body.post.id;
  });

  test('create comment', async () => {
    const res = await agent.post(`/comments/${postId}`).send({ content: 'Nice post' }).expect(200);
    expect(res.body.comment).toBeDefined();
    expect(res.body.comment.content).toBe('Nice post');
  });

  test('like post', async () => {
    const res = await agent.post(`/likes/${postId}`).expect(200);
    expect(res.body.like).toBeDefined();
  });

  test('unlike post', async () => {
    await agent.delete(`/likes/${postId}`).expect(200);
  });
});
