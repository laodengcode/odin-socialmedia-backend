import { faker } from '@faker-js/faker';
import prisma from "../src/prismaClient";

async function main() {
  console.log("Seeding database...");

  // Create 10 users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.username(),
        email: faker.internet.email(),
        passwordHash: "$2b$10$123456789012345678901u6pQF3E7LzvjXrxE/Y1bHZ2tQ6FjvYmu", // fake hash
        name: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        imageUrl: faker.image.avatar(),
      },
    });
    users.push(user);
  }

  // Create posts
  for (const user of users) {
    for (let i = 0; i < 3; i++) {
      await prisma.post.create({
        data: {
          authorId: user.id,
          content: faker.lorem.paragraph(),
          imageUrl: undefined,
        },
      });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
