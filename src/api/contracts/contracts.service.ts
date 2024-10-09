import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { PrismaService } from '../prisma/prisma.service';
import { getContractProductsFromSat } from '../shared/utils/get-contract-products-from-sat';
import { getContractGraphFromSat } from '../shared/utils/get-contract-graph';
import { v4 as uuidv4 } from 'uuid';
import { searchContractssFromSat } from '../shared/utils/search-contracts';

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
        closed: satProducts.client.yopildi,
        contractId,
        clientFullName: satProducts.client.fio,
        passportSeries: satProducts.client.passport,
        pinfl: satProducts.client.pnfl,
        phone: satProducts.client.tel1,
        secondPhone: satProducts.client.tel2,
        createdDate: satProducts.client.sana,
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

  async findAll(
    branchId: string,
    page: number,
    limit: number,
    search: string,
    prefix?: string,
  ) {
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
      select: {
        id: true,
        contractId: true,
        phone: true,
        secondPhone: true,
        passportSeries: true,
        pinfl: true,
        createdAt: true,
        closed: true,
        clientFullName: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (search && contracts.length < limit) {
      const additionalContracts = await searchContractssFromSat(
        prefix,
        search,
        limit - contracts.length,
      );

      if (additionalContracts.length !== 0)
        for await (const contract of additionalContracts) {
          contracts.push({
            closed: contract.yopildi,
            contractId: contract.shraqam,
            createdAt: new Date(contract.sana),
            id: uuidv4(),
            passportSeries: contract.passport,
            phone: contract.phone1,
            pinfl: contract.pnfl,
            secondPhone: contract.phone2,
            clientFullName: contract.fio,
          });
        }
    }
    return { data: contracts, pageSize: limit, total, current: page };
  }

  async findOne(id: string, userId: string) {
    try {
      const contract = await this.prismaService.contracts.findUnique({
        where: { contractId: id },
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

      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      const graph = await this.getContractGraph(id);

      if (!contract) {
        const satContract = await this.getContractProducts(id);

        if (!satContract) throw new NotFoundException('Shartnoma topilmadi');

        const receipts = await this.prismaService.receipts.findMany({
          where: {
            contractId: contract.contractId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          data: {
            id: uuidv4(),
            secondPhone: satContract.data.secondPhone,
            passportSeries: satContract.data.passportSeries,
            pinfl: satContract.data.pinfl,
            createdAt: new Date(satContract.data.createdDate),
            updatedAt: new Date(satContract.data.createdDate),
            staffName: user.firstName + ' ' + user.lastName,
            phoneNumber: satContract.data.phone,
            paycheckNumber: id,
            clientName: satContract.data.clientFullName,
            items: satContract.data.products.map((product) => ({
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
            receipt: receipts,
            graph: graph.data,
            payments: graph.payments,
          },
        };
      }

      const receipts = await this.prismaService.receipts.findMany({
        where: {
          contractId: contract.contractId,
        },
        orderBy: {
          createdAt: 'desc',
        },
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
          receipt: receipts,
          graph: graph.data,
          payments: graph.payments,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const contract = await this.prismaService.contracts.findUnique({
        where: { id },
        include: {
          products: { select: { productId: true, label: true } },
        },
      });

      if (!contract) throw new NotFoundException('Shartnoma topilmadi');
      const receipts = await this.prismaService.receipts.findMany({
        where: {
          contractId: contract.contractId,
        },
      });

      if (receipts.length)
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
