// src/prismaClient.js
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

// Use a global so hot reload / tests don't create multiple clients (Node dev)
let prisma;
if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}
prisma = global.__prisma;

module.exports = prisma;
