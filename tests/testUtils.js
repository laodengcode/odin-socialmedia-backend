// tests/testUtils.js
const request = require('supertest');
const app = require('../src/app');

async function registerAndLogin(agent, userData) {
  // Register
  await agent
    .post('/auth/register')
    .send(userData)
    .expect(200);

  // agent holds cookies after register because server auto-logs on register
  return agent;
}

module.exports = {
  request,
  app,
  registerAndLogin
};
