// tests/setup.js
const prisma = require('../src/prismaClient');

beforeAll(async () => {
    jest.setTimeout(20000);
  // Ensure DB clean (order matters for FK)
  await prisma.like.deleteMany().catch(() => {});
  await prisma.comment.deleteMany().catch(() => {});
  await prisma.post.deleteMany().catch(() => {});
  await prisma.follow.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});
});

afterAll(async () => {
  await prisma.$disconnect();
});