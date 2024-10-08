import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { getCategoryName } from '../shared/utils/get-category-name';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.prismaService.products.create({
      data: createProductDto,
    });

    return newProduct;
  }

  async findAll(
    page: number,
    limit: number,
    branchId: string,
    search?: string,
    categoryId?: string,
    label?: string,
  ) {
    const total = await this.prismaService.products.count({
      where: {
        branchId,
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
        ...(categoryId && { categoryId }),
        ...(label && {
          labels: {
            some: {
              label: { contains: label, mode: 'insensitive' },
            },
          },
        }),
      },
    });

    const products = await this.prismaService.products.findMany({
      include: {
        labels: {
          where: { sold: false },
          select: {
            id: true,
            label: true,
          },
        },
      },
      where: {
        branchId,
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
        ...(categoryId && { categoryId }),
        ...(label && {
          labels: {
            some: {
              label: { contains: label, mode: 'insensitive' },
            },
          },
        }),
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: products,
      total,
      pageSize: limit,
      current: page,
    };
  }

  async findAllBlack(
    page: number,
    limit: number,
    branchId: string,
    search?: string,
    status?: 'active' | 'inactive',
  ) {
    const total = await this.prismaService.products.count({
      where: {
        black: true,
        branchId,
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
        ...(status
          ? status === 'active'
            ? { count: { gte: 1 } }
            : {
                count: 0,
              }
          : {}),
      },
    });

    const products = await this.prismaService.products.findMany({
      include: {
        labels: true,
      },
      where: {
        black: true,
        branchId,
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
        ...(status
          ? status === 'active'
            ? { count: { gte: 1 } }
            : {
                count: 0,
              }
          : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        count: 'desc',
      },
    });

    return {
      data: products,
      total,
      pageSize: limit,
      current: page,
    };
  }

  async createManual(createProductDto: CreateProductDto, branchId: string) {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        let category = await prisma.categories.findUnique({
          where: { code: createProductDto.catalogcode.slice(0, 5) },
        });

        if (!category) {
          const catalogName = await getCategoryName(
            createProductDto.catalogcode.slice(0, 5),
          );

          category = await prisma.categories.create({
            data: {
              code: createProductDto.catalogcode.slice(0, 5),
              name: catalogName,
              branchId: branchId,
            },
          });
        }

        const existProduct = await prisma.products.findFirst({
          where: { name: createProductDto.name },
        });

        if (existProduct && existProduct.name == createProductDto.name) {
          await prisma.products.update({
            where: { id: existProduct.id },
            data: {
              count: existProduct.count + Number(createProductDto.count),
            },
          });

          if (createProductDto?.lables) {
            await prisma.products.update({
              where: { id: existProduct.id },
              data: {
                isMarked: true,
              },
            });

            for await (const mark of createProductDto.lables) {
              await prisma.productMarks.create({
                data: {
                  label: mark,
                  productId: existProduct.id,
                },
              });
            }
          }

          return {
            data: existProduct,
            message: 'Mahsulot muvaffaqqiyatli tahrirlandi',
          };
        } else {
          const newProduct = await this.create({
            name: createProductDto.name,
            packagecode: createProductDto.packagecode,
            count: +createProductDto.count,
            vat: createProductDto.vat,
            categoryId: category.id,
            branchId: branchId,
            catalogcode: createProductDto.catalogcode,
            barcode: createProductDto.barcode,
            amount: +createProductDto.amount,
            discountAmount: +createProductDto.discountAmount,
          });

          if (createProductDto?.lables) {
            await prisma.products.update({
              where: { id: newProduct.id },
              data: {
                isMarked: true,
              },
            });
            for await (const mark of createProductDto.lables) {
              await prisma.productMarks.create({
                data: {
                  label: mark,
                  productId: newProduct.id,
                },
              });
            }
          }

          return {
            data: newProduct,
            message: 'Mahsulot muvaffaqqiyatli taratildi',
          };
        }
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findOne(id: string) {
    const product = await this.prismaService.products.findUnique({
      where: { id },
      include: {
        labels: {
          select: {
            id: true,
            label: true,
            sold: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    return product;
  }

  async deleteLabel(id: string) {
    const label = await this.prismaService.productMarks.findUnique({
      where: { id },
    });

    if (!label) throw new NotFoundException('Markerovka topilmadi');

    await this.prismaService.productMarks.delete({ where: { id } });

    if (!label.sold)
      await this.prismaService.products.update({
        where: { id: label.productId },
        data: {
          count: {
            decrement: 1,
          },
        },
      });

    return 'Markerovka muvaffaqqiyatli o`chirildi';
  }

  async addLabel(productId: string, label: string) {
    const product = await this.prismaService.products.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const newLabel = await this.prismaService.productMarks.create({
      data: {
        productId,
        label,
      },
    });

    await this.prismaService.products.update({
      where: { id: productId },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    return newLabel;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    delete updateProductDto.lables;

    return await this.prismaService.products.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    const product = this.prismaService.products.findUnique({
      where: { id },
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    await this.prismaService.products.delete({ where: { id } });

    return 'Mahsulot muvaffaqqiyatli o`chirildi';
  }
}
