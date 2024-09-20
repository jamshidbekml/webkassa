import { PrismaClient } from '@prisma/client';
import 'colors';
import * as argon2 from 'argon2';
import { branches } from './branches';
import { products } from './products';

export const admin = {
  username: 'test',
  password: 'test',
};

async function seed() {
  try {
    const prismaClient = new PrismaClient();
    let superadmin = await prismaClient.users.findUnique({
      where: { username: admin.username },
    });
    if (!superadmin) {
      const hash = await argon2.hash('test');
      admin.password = hash;
      superadmin = await prismaClient.users.create({
        data: {
          username: admin.username,
          password: admin.password,
          role: 'superadmin',
          firstName: 'Jamshidbek',
          lastName: 'Odiljonov',
          middleName: "Nodirbek og'li",
        },
      });
      console.log('User seeded successfully'.bgGreen.bold);
    } else console.log('User already seeded'.bgYellow.bold);
    await branches();
    await products();
  } catch (err) {
    console.log(`Error seeding data: ${err}`.bgYellow.bold);
  }
}

seed();
