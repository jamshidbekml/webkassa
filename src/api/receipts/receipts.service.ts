import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePaymentDto, CreateReceiptDto } from './dto/create-receipt.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PAYMENT_TYPE, RECEIPT_TYPE } from '@prisma/client';
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
          const newPayment = await prisma.payments.create({
            data: {
              receiptId: receipt.id,
              amount: payment.amount,
              paymentType: payment.paymentType,
              cashierId: userId,
            },
          });

          const user = await prisma.users.findUnique({
            where: { id: userId },
          });
          const written = await writeTransactionToSat({
            amount: payment.amount / 100,
            type: payment.paymentType,
            contractid: createReceiptDto.contractId,
            user: `${user.firstName} ${user.lastName} ${user.middleName}`,
            userId: user.satId,
          });

          if (!written) {
            throw new InternalServerErrorException(
              "SATga yozishda xatolik yuz berdi. To'lovni qaytadan yuborishni unutmang!",
            );
          }
          await prisma.payments.update({
            where: {
              id: newPayment.id,
            },
            data: {
              written: true,
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
      select: {
        contract: {
          select: {
            products: {
              select: {
                product: true,
                labels: { select: { label: true } },
                amount: true,
                count: true,
                discountAmount: true,
              },
            },
          },
        },
        payments: { select: { paymentType: true, amount: true } },
        saleId: true,
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
        payments: {
          include: { cashier: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!receipt) throw new BadRequestException('Bunday chek topilmadi');
    return { data: receipt };
  }

  async createPayment(userId: string, saleId: string, body: CreatePaymentDto) {
    try {
      const receipt = await this.prismaService.receipts.findUnique({
        where: { saleId },
        include: {
          contract: {
            select: {
              contractId: true,
            },
          },
        },
      });

      if (!receipt)
        throw new BadRequestException('Bunday savdo cheki topilmadi');
      const payment = await this.prismaService.payments.create({
        data: {
          amount: +body.amount * 100,
          paymentType: body.type,
          cashierId: userId,
          receiptId: receipt.id,
        },
      });

      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });
      const written = await writeTransactionToSat({
        amount: body.amount,
        type: body.type,
        contractid: receipt.contract.contractId,
        user: `${user.firstName} ${user.lastName} ${user.middleName}`,
        userId: user.satId,
      });

      if (!written)
        throw new BadRequestException(
          "SATga yozib bo'lmadi. To'lovni qayta yuborishni unutmang!",
        );

      await this.prismaService.payments.update({
        where: {
          id: payment.id,
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
