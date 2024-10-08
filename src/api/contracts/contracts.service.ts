import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { PrismaService } from '../prisma/prisma.service';
import { getContractProductsFromSat } from '../shared/utils/get-contract-products-from-sat';
import { getContractGraphFromSat } from '../shared/utils/get-contract-graph';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContractsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createContractDto: CreateContractDto, branchId: string) {
    try {
      const isExist = await this.prismaService.contracts.findUnique({
        where: { contractId: createContractDto.contractId },
      });

      if (isExist) throw new BadRequestException('Bunday shartnoma mavjud');

      return await this.prismaService.$transaction(async (prisma) => {
        const newContract = await prisma.contracts.create({
          data: {
            branchId,
            contractId: createContractDto.contractId,
            phone: createContractDto.phone,
            secondPhone: createContractDto.secondPhone,
            pinfl: createContractDto.pinfl,
            passportSeries: createContractDto.passportSeries,
            clientFullName: createContractDto.clientFullName,
          },
        });

        for await (const product of createContractDto.products) {
          const dbProduct = await prisma.products.findUnique({
            where: {
              id: product.productId,
            },
          });

          if (dbProduct.count === 0)
            throw new BadRequestException(
              'Omborda mahsulot mavjud emas yoki qolmagan!',
            );

          await prisma.contractProducts.create({
            data: {
              contractId: newContract.id,
              productId: product.productId,
              amount: product.amount * 100,
              other: product.discountAmount * 100,
              count: 1,
              barcode: dbProduct.barcode,
              classCode: dbProduct.catalogcode,
              name: dbProduct.name,
              vatPercent: Number(dbProduct.vat),
              packageCode: dbProduct.packagecode,
              vat:
                product.amount - product.discountAmount === 0
                  ? 0
                  : +(
                      ((product.amount - product.discountAmount) * 12) /
                      (100 + Number(dbProduct.vat))
                    ).toFixed(2) * 100,
              label: product?.label,
            },
          });

          await prisma.products.update({
            where: {
              id: product.productId,
            },
            data: {
              count: {
                decrement: 1,
              },
            },
          });

          if (product?.label) {
            const productMark = await prisma.productMarks.findUnique({
              where: {
                label: product.label,
              },
            });

            if (!productMark || productMark.sold)
              throw new BadRequestException(
                'Bunday markerovka mavjud emas yoki sotilgan!',
              );

            await prisma.productMarks.update({
              where: { label: product.label },
              data: { sold: true },
            });
          }
        }

        return newContract;
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getContractProducts(contractId: string) {
    const satProducts = await getContractProductsFromSat(contractId);
    const products = [];
    const labels = {};
    for await (const product of satProducts.products) {
      const foundProduct = await this.prismaService.products.findFirst({
        where: {
          name: product.name,
        },
        include: {
          labels: {
            where: { sold: false },
          },
        },
      });

      if (!foundProduct || foundProduct.name !== product.name)
        throw new BadRequestException(
          `Satdan kelgan mahsulot kassa mahsuloti bilan mos kelmayabdi! Mahsulot: ${product.name}`,
        );

      labels[foundProduct.id] = foundProduct.labels.map((e) => e.label);
      products.push({
        uid: uuidv4(),
        id: foundProduct.id,
        name: foundProduct.name,
        isMarked: foundProduct.isMarked,
        amount: product.summa,
        barcode: foundProduct.barcode,
        vatPercent: Number(foundProduct.vat),
        packageCode: foundProduct.packagecode,
        classCode: foundProduct.catalogcode,
        discount: 0,
        other: 0,
        count: 1,
      });
    }

    for await (const product of satProducts.bonus) {
      const foundProduct = await this.prismaService.products.findFirst({
        where: {
          name: product.name,
        },
        include: {
          labels: {
            where: { sold: false },
          },
        },
      });

      if (!foundProduct || foundProduct.name !== product.name)
        throw new BadRequestException(
          `Satdan kelgan mahsulot kassa mahsuloti bilan mos kelmayabdi! Mahsulot: ${product.name}`,
        );

      labels[foundProduct.id] = foundProduct.labels.map((e) => e.label);
      products.push({
        uid: uuidv4(),
        id: foundProduct.id,
        name: foundProduct.name,
        isMarked: foundProduct.isMarked,
        amount: product.summa,
        discount: 0,
        other: product.summa,
        barcode: foundProduct.barcode,
        vatPercent: Number(foundProduct.vat),
        packageCode: foundProduct.packagecode,
        classCode: foundProduct.catalogcode,
        count: 1,
      });
    }

    return {
      data: {
        contractId,
        clientFullName: satProducts.client.fio,
        passportSeries: satProducts.client.passport,
        pinfl: satProducts.client.pnfl,
        phone: satProducts.client.tel1,
        products,
        labels,
      },
    };
  }

  async getContractGraph(contractId: string) {
    const { grafik, tulov } = await getContractGraphFromSat(contractId);

    return {
      data: Array.isArray(grafik)
        ? grafik.map((e) => ({
            id: e.nomer,
            date: e.sana,
            amount: e.summa,
            debt: e.qoldiq,
            payed: e.tulov,
            closed: e.yopildi,
          }))
        : [],
      payments: tulov,
    };
  }

  async findAll(branchId: string, page: number, limit: number, search: string) {
    const total = await this.prismaService.contracts.count({
      where: {
        branchId,
        ...(search
          ? {
              OR: [
                { phone: { contains: search, mode: 'insensitive' } },
                { secondPhone: { contains: search, mode: 'insensitive' } },
                { contractId: { contains: search, mode: 'insensitive' } },
                {
                  pinfl: { contains: search, mode: 'insensitive' },
                },
                {
                  passportSeries: { contains: search, mode: 'insensitive' },
                },
                {
                  clientFullName: { contains: search, mode: 'insensitive' },
                },
              ],
            }
          : {}),
        previous: false,
      },
    });

    const contracts = await this.prismaService.contracts.findMany({
      where: {
        branchId,
        ...(search
          ? {
              OR: [
                { phone: { contains: search, mode: 'insensitive' } },
                { contractId: { contains: search, mode: 'insensitive' } },
                {
                  pinfl: { contains: search, mode: 'insensitive' },
                },
                {
                  passportSeries: { contains: search, mode: 'insensitive' },
                },
                {
                  clientFullName: { contains: search, mode: 'insensitive' },
                },
              ],
            }
          : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: contracts, pageSize: limit, total, current: page };
  }

  async findOne(id: string, userId: string) {
    const contract = await this.prismaService.contracts.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            amount: true,
            count: true,
            discount: true,
            classCode: true,
            barcode: true,
            other: true,
            packageCode: true,
            vatPercent: true,
            vat: true,
            name: true,
            label: true,
          },
        },
        receipt: {
          include: { payments: true },
        },
        branch: {
          select: {
            name: true,
            companyAddress: true,
            inn: true,
            token: true,
          },
        },
      },
    });

    if (!contract) throw new NotFoundException('Shartnoma topilmadi');

    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
    });

    return {
      data: {
        id: contract.id,
        secondPhone: contract.secondPhone,
        passportSeries: contract.passportSeries,
        pinfl: contract.pinfl,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        staffName: user.firstName + ' ' + user.lastName,
        phoneNumber: contract.phone,
        paycheckNumber: contract.contractId,
        clientName: contract.clientFullName,
        items: contract.products.map((product) => ({
          id: product.id,
          barcode: product.barcode,
          name: product.name,
          packageCode: product.packageCode,
          vatPercent: Number(product.vatPercent),
          price: product.amount,
          amount: product.count * 1000,
          other: product.other,
          vat: product.vat,
          classCode: product.classCode,
          discount: 0,
          label: product.label,
        })),
        receipt: contract.receipt,
      },
    };
  }

  async remove(id: string) {
    try {
      const contract = await this.prismaService.contracts.findUnique({
        where: { id },
        include: {
          receipt: { select: { type: true } },
          products: { select: { productId: true, label: true } },
        },
      });

      if (contract.receipt.length)
        throw new NotFoundException(
          "Shartnomaga to'lov qilingan, texniklar bilan bog'laning!",
        );

      await this.prismaService.$transaction(async (prisma) => {
        for await (const product of contract.products) {
          await prisma.products.update({
            where: { id: product.productId },
            data: {
              count: {
                increment: 1,
              },
            },
          });

          if (product.label) {
            await prisma.productMarks.update({
              where: { label: product.label },
              data: {
                sold: false,
              },
            });
          }
        }
        await prisma.contracts.delete({ where: { id } });
      });

      return "Shartnoma muvaffaqqiyatli o'chirildi";
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
