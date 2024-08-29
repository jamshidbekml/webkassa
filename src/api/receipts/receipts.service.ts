import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto, CreateReceiptDto } from './dto/create-receipt.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PAYMENT_TYPE, RECEIPT_TYPE } from '@prisma/client';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createReceiptDto: CreateReceiptDto,
    userId: string,
    branchId: string,
  ) {
    try {
      await this.prismaService.$transaction(async (prisma) => {
        const receipt = await prisma.receipts.create({
          data: {
            cashierId: userId,
            branchId,
            contractId: createReceiptDto.contractId,
            cTin: createReceiptDto.cTin,
            cName: createReceiptDto.cName,
            tAmount: createReceiptDto.tAmount * 100,
            tVat: createReceiptDto.tVat * 100,
            saleId: createReceiptDto.saleId,
            type: createReceiptDto.type,
          },
        });

        for await (const payment of createReceiptDto.payments) {
          await prisma.payments.create({
            data: {
              receiptId: receipt.id,
              amount: payment.amount,
              paymentType: payment.paymentType,
              cashierId: userId,
            },
          });
        }

        return { data: receipt };
      });
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

    const effectiveStartDate = new Date(startDate) ?? todayStart;
    const effectiveEndDate = new Date(endDate) ?? todayEnd;
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
                {
                  saleId: { contains: search, mode: 'insensitive' },
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
      include: {
        contract: {
          include: {
            products: {
              include: { labels: true },
            },
          },
        },
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
        cashier: { select: { name: true } },
        payments: {
          include: { cashier: { select: { name: true } } },
        },
      },
    });

    if (!receipt) throw new BadRequestException('Bunday chek topilmadi');
    return { data: receipt };
  }

  async createPayment(userId: string, saleId: string, body: CreatePaymentDto) {
    const receipt = await this.prismaService.receipts.findUnique({
      where: { saleId },
    });

    if (!receipt) throw new BadRequestException('Bunday savdo cheki topilmadi');

    await this.prismaService.payments.create({
      data: {
        amount: +body.amount * 100,
        paymentType: body.type,
        cashierId: userId,
        receiptId: receipt.id,
      },
    });

    return `To'lov muvaffaqqiyatli qabul qilindi!`;
  }

  async findPayments(
    branchId: string,
    type: PAYMENT_TYPE,
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

    const effectiveStartDate = startDate ?? todayStart;
    const effectiveEndDate = endDate ?? todayEnd;
    const payments = await this.prismaService.payments.findMany({
      where: {
        receipt: {
          branchId,
        },
        paymentType: type,
        ...(search
          ? {
              OR: [
                {
                  receipt: {
                    contract: {
                      OR: [
                        { phone: { contains: search, mode: 'insensitive' } },
                        {
                          contractId: { contains: search, mode: 'insensitive' },
                        },
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
                },
                {
                  receipt: {
                    saleId: { contains: search, mode: 'insensitive' },
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
      include: { receipt: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.payments.count({
      where: {
        receipt: {
          branchId,
        },
        paymentType: type,
        ...(search
          ? {
              OR: [
                {
                  receipt: {
                    contract: {
                      OR: [
                        { phone: { contains: search, mode: 'insensitive' } },
                        {
                          contractId: { contains: search, mode: 'insensitive' },
                        },
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
                },
                {
                  receipt: {
                    saleId: { contains: search, mode: 'insensitive' },
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
    });

    return {
      data: payments,
      pageSize: limit,
      total,
      current: page,
    };
  }
}
