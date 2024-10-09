import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RECEIPT_TYPE } from '@prisma/client';
import { writeTransactionToSat } from '../shared/utils/write-payment-to-sat';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createReceiptDto: CreateReceiptDto,
    userId: string,
    branchId: string,
  ) {
    try {
      const receipt = await this.prismaService.$transaction(async (prisma) => {
        const contract = await prisma.contracts.findUnique({
          where: { contractId: createReceiptDto.contractId },
        });

        if (!contract) {
          const receipt = await prisma.receipts.create({
            data: {
              cashierId: userId,
              branchId,
              contractId: createReceiptDto.contractId,
              type: 'sale',
              receiptSeq: createReceiptDto.receiptSeq,
              dateTime: createReceiptDto.dateTime,
              fiscalSign: createReceiptDto.fiscalSign,
              terminalId: createReceiptDto.terminalId,
              qrCodeURL: createReceiptDto.qrCodeURL,
              companyName: createReceiptDto.companyName,
              companyAddress: createReceiptDto.companyAddress,
              companyINN: createReceiptDto.companyINN,
              phoneNumber: createReceiptDto.phoneNumber,
              clientName: createReceiptDto.clientName,
              staffName: createReceiptDto.staffName,
              received: createReceiptDto.received,
              card: createReceiptDto.card,
              cash: createReceiptDto.cash,
            },
          });

          for await (const product of createReceiptDto.products) {
            await prisma.receiptProducts.create({
              data: {
                receiptId: receipt.id,
                amount: product.amount,
                barcode: product.barcode,
                classCode: product.classCode,
                count: product.count,
                name: product.name,
                other: product.discountAmount,
                packageCode: product.packageCode,
                vatPercent: product.vatPercent,
                vat: product.vat,
                label: product?.label,
                productId: product.productId,
              },
            });
          }

          return receipt;
        }

        const receiptExist = await prisma.contracts.findMany({
          where: { contractId: contract.contractId },
          orderBy: { createdAt: 'asc' },
        });

        console.log(receiptExist);

        const receiptType = receiptExist.length >= 1 ? 'credit' : 'sale';
        const receipt = await prisma.receipts.create({
          data: {
            cashierId: userId,
            branchId,
            contractId: createReceiptDto.contractId,
            type: receiptType,
            receiptSeq: createReceiptDto.receiptSeq,
            dateTime: createReceiptDto.dateTime,
            fiscalSign: createReceiptDto.fiscalSign,
            terminalId: createReceiptDto.terminalId,
            qrCodeURL: createReceiptDto.qrCodeURL,
            companyName: createReceiptDto.companyName,
            companyAddress: createReceiptDto.companyAddress,
            companyINN: createReceiptDto.companyINN,
            phoneNumber: createReceiptDto.phoneNumber,
            clientName: createReceiptDto.clientName,
            staffName: createReceiptDto.staffName,
            received: createReceiptDto.received,
            card: createReceiptDto.card,
            cash: createReceiptDto.cash,
          },
        });

        for await (const product of createReceiptDto.products) {
          await prisma.receiptProducts.create({
            data: {
              receiptId: receipt.id,
              amount: product.amount,
              barcode: product.barcode,
              classCode: product.classCode,
              count: product.count,
              name: product.name,
              other: product.discountAmount,
              packageCode: product.packageCode,
              vatPercent: product.vatPercent,
              vat: product.vat,
              label: product?.label,
              productId: product.productId,
            },
          });
        }

        return receipt;
      });

      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      const written = await writeTransactionToSat({
        receivedCard: +createReceiptDto.card / 100,
        receivedCash: +createReceiptDto.cash / 100,
        contractid: receipt.contractId,
        user: `${user.firstName} ${user.lastName} ${user.middleName}`,
        userId: user.satId,
      });

      if (!written)
        throw new Error(
          "SATga yozib bo'lmadi. To'lovni qayta yuborishni unutmang!",
        );

      await this.prismaService.receipts.update({
        where: {
          id: receipt.id,
        },
        data: {
          written: true,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findAll(
    branchId: string,
    type: RECEIPT_TYPE,
    page: number,
    limit: number,
    search?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const effectiveStartDate = startDate ? new Date(startDate) : todayStart;
    const effectiveEndDate = endDate ? new Date(endDate) : todayEnd;

    const receipts = await this.prismaService.receipts.findMany({
      where: {
        branchId,
        type,
        ...(search
          ? {
              OR: [
                {
                  clientName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                  phoneNumber: {
                    contains: search,
                    mode: 'insensitive',
                  },
                  contractId: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {
              createdAt: {
                gte: new Date(effectiveStartDate),
                lte: new Date(effectiveEndDate),
              },
            }),
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.receipts.count({
      where: {
        branchId,
        type,
        ...(search
          ? {
              contract: {
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
              },
            }
          : {
              createdAt: {
                gte: new Date(effectiveStartDate),
                lte: new Date(effectiveEndDate),
              },
            }),
      },
    });

    return {
      data: receipts,
      pageSize: limit,
      total,
      current: page,
    };
  }

  async findOneReceipt(id: string) {
    const receipt = await this.prismaService.receipts.findUnique({
      where: { id },
      include: {
        cashier: { select: { firstName: true, lastName: true } },
        products: true,
      },
    });

    if (!receipt) throw new BadRequestException('Bunday chek topilmadi');
    return { data: receipt };
  }
}
