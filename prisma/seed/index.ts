import { PrismaClient } from '@prisma/client';
import 'colors';
import * as argon2 from 'argon2';
import { branches } from './branches';

export const admin = {
  username: 'test',
  password: '',
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
      console.log('Data seeded successfully'.bgGreen.bold);
      return;
    }
    branches();
    console.log('Data already seeded'.bgYellow.bold);
  } catch (err) {
    console.log(`Error seeding data: ${err}`.bgYellow.bold);
  }
}

seed();
