import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { PrismaService } from '../prisma/prisma.service';
import { getContractProductsFromSat } from '../shared/utils/get-contract-products-from-sat';
import { getContractGraphFromSat } from '../shared/utils/get-contract-graph';

@Injectable()
export class ContractsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createContractDto: CreateContractDto, branchId: string) {
    const isExist = await this.prismaService.contracts.findUnique({
      where: { contractId: createContractDto.contractId },
    });
    if (isExist) throw new BadRequestException('Bunday shartnoma mavjud');
    const newContract = await this.prismaService.contracts.create({
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
      const contractProduct = await this.prismaService.contractProducts.create({
        data: {
          contractId: newContract.id,
          productId: product.productId,
          amount: product.amount,
          discountAmount: product.discountAmount,
          count: product.count,
        },
      });

      if (product?.labels) {
        for await (const label of product.labels) {
          await this.prismaService.contractProductLabels.create({
            data: {
              contractProductId: contractProduct.id,
              label,
            },
          });
        }
      }
    }

    return 'Shartnoma yaratildi!';
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
        id: foundProduct.id,
        name: foundProduct.name,
        isMarked: foundProduct.isMarked,
        amount: product.summa,
        discountAmount: 0,
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
        id: foundProduct.id,
        name: foundProduct.name,
        isMarked: foundProduct.isMarked,
        amount: product.summa,
        discountAmount: 0,
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
      data: grafik.map((e) => ({
        id: e.nomer,
        date: e.sana,
        amount: e.summa,
        debt: e.qoldiq,
        payed: e.tulov,
        closed: e.yopildi,
      })),
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

  async findOne(id: string) {
    const contract = await this.prismaService.contracts.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            product: {
              select: {
                id: true,
                barcode: true,
                catalogcode: true,
                name: true,
                packagecode: true,
                vat: true,
              },
            },
            amount: true,
            count: true,
            discountAmount: true,
            labels: { select: { label: true } },
          },
        },
      },
    });

    if (!contract) throw new NotFoundException('Shartnoma topilmadi');

    return {
      data: {
        id: contract.id,
        clientFullName: contract.clientFullName,
        contractId: contract.contractId,
        phone: contract.phone,
        secondPhone: contract.secondPhone,
        passportSeries: contract.passportSeries,
        pinfl: contract.pinfl,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        products: contract.products.map((product) => ({
          id: product.product.id,
          barcode: product.product.barcode,
          psid: product.product.catalogcode,
          name: product.product.name,
          packageCode: product.product.packagecode,
          vat: Number(product.product.vat) / 100,
          price: product.amount * 100,
          amount: product.count,
          discountAmount: 0,
          labels: product.labels.map((e) => e.label),
          units: 'шт',
          isDecimalUnits: false,
          unitCode: null,
          commissionPINFL: null,
          commissionTIN: null,
        })),
      },
    };
  }

  async remove(id: string) {
    const contract = await this.prismaService.contracts.findUnique({
      where: { id },
      include: { receipts: true },
    });

    if (contract.receipts.length)
      throw new NotFoundException(
        "Shartnomaga to'lov qilingan, o'chirish mumkin emas",
      );

    await this.prismaService.contracts.delete({ where: { id } });

    return "Shartnoma muvaffaqqiyatli o'chirildi";
  }
}
