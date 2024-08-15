import { PrismaClient } from '@prisma/client';
import 'colors';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
const filiallar = [
  {
    inn: configService.get('BRANCH_INN'),
    password: configService.get('BRANCH_PASSWORD'),
    name: '"QUVASOY MARKET CITY" MCHJ',
  },
];

export async function branches() {
  try {
    const prismaClient = new PrismaClient();

    for await (const branch of filiallar) {
      const exists = await prismaClient.branches.findUnique({
        where: { inn: branch.inn },
      });

      if (!exists) {
        await prismaClient.branches.create({
          data: {
            ...branch,
          },
        });
        continue;
      }
    }
    console.log('Branches seeded successfully'.bgGreen.bold);
  } catch (err) {
    console.log(`Error seeding data: ${err}`.bgYellow.bold);
  }
}
