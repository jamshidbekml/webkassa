import { BadRequestException, Injectable } from '@nestjs/common';
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
      const { data } = await this.prismaService.$transaction(async (prisma) => {
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

        if (createReceiptDto?.products?.length) {
          for await (const product of createReceiptDto.products) {
            await prisma.products.update({
              where: {
                id: product.productId,
              },
              data: {
                count: {
                  decrement: product.count,
                },
              },
            });
          }
        }
        return { data: receipt };
      });

      return {
        data: data,
      };
    } catch (err) {
      throw new BadRequestException(err.message);
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
                  contract: {
                    OR: [
                      { phone: { contains: search, mode: 'insensitive' } },
                      { contractId: { contains: search, mode: 'insensitive' } },
                      {
                        pinfl: { contains: search, mode: 'insensitive' },
                      },
                      {
                        passportSeries: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        clientFullName: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    ],
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
      select: {
        contract: {
          select: {
            clientFullName: true,
            phone: true,
            contractId: true,
            secondPhone: true,
          },
        },
        terminalId: true,
        receiptSeq: true,
        fiscalSign: true,
        dateTime: true,
        qrCodeURL: true,
        received: true,
        card: true,
        cash: true,
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
      },
    });

    if (!receipt) throw new BadRequestException('Bunday chek topilmadi');
    return { data: receipt };
  }

  async createPayment(
    createReceiptDto: CreateReceiptDto,
    userId: string,
    branchId: string,
  ) {
    try {
      const { receipt } = await this.prismaService.$transaction(
        async (prisma) => {
          const receipt = await prisma.receipts.create({
            data: {
              cashierId: userId,
              branchId,
              contractId: createReceiptDto.contractId,
              type: 'credit',
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
            include: {
              contract: true,
            },
          });

          if (createReceiptDto?.products?.length) {
            for await (const product of createReceiptDto.products) {
              await prisma.products.update({
                where: {
                  id: product.productId,
                },
                data: {
                  count: {
                    decrement: product.count,
                  },
                },
              });
            }
          }
          return { receipt };
        },
      );

      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      const written = await writeTransactionToSat({
        receivedCard: +createReceiptDto.card * 100,
        receivedCash: +createReceiptDto.cash * 100,
        contractid: receipt.contract.contractId,
        user: `${user.firstName} ${user.lastName} ${user.middleName}`,
        userId: user.satId,
      });

      if (!written)
        throw new BadRequestException(
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

      return `To'lov muvaffaqqiyatli qabul qilindi!`;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
