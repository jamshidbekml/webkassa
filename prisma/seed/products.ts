import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { ExcelService } from '../../src/api/excel/excel.service';

export async function products() {
  try {
    const prismaClient = new PrismaClient();
    const exelService = new ExcelService();

    const { Лист1: data } = exelService.convertExcelToJson(
      join(__dirname, '..', '..', 'products.xlsx'),
    );

    const newData: {
      name: string;
      catalogcode: string;
      packagecode: string;
      count: number;
      barcode: string;
      vat: number;
    }[] = data.map((e) => ({
      name: e.махсулотноми,
      catalogcode: e.МИХК.slice(0, 17),
      packagecode: e.Упаковка.slice(-7),
      count: 50,
      barcode: '',
      vat: 12,
    }));

    const branches = await prismaClient.branches.findMany();

    for await (const branch of branches) {
      const caytegory = await prismaClient.categories.upsert({
        where: {
          code: '00000',
        },
        update: {
          name: 'Черные продукты',
        },
        create: {
          code: '00000',
          name: 'Черные продукты',
          branchId: branch.id,
        },
      });

      for await (const product of newData) {
        const exist = await prismaClient.products.findFirst({
          where: { name: product.name },
        });

        if (exist && exist?.name == product.name) continue;
        await prismaClient.products.create({
          data: {
            ...product,
            branchId: branch.id,
            categoryId: caytegory.id,
            black: true,
          },
        });
      }
    }

    console.log('Products seeded successfully'.bgGreen.bold);
  } catch (err) {
    console.log(`Error seeding products: ${err}`.bgYellow.bold);
  }
}
