import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

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
      skip: (page - 1) * limit,
      take: limit,
    });
    const products = await this.prismaService.products.findMany({
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
      pageSize: Math.ceil(total / limit),
      current: page,
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} product`;
  // }

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
