import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RECEIPT_TYPE } from '@prisma/client';
import { writeTransactionToSat } from '../shared/utils/write-payment-to-sat';
import { isUUID } from '../shared/utils/uuid-checker';
import { getContractGraphFromSat } from '../shared/utils/get-contract-graph';
import { checkIsOldContract } from '../shared/utils/chekc-is-old-contract';
import { getSatPayments } from '../shared/utils/get-sat-payments';
import { RefundReceiptDto } from './dto/update-receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createReceiptDto: CreateReceiptDto,
    userId: string,
    branchId: string,
  ) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      const receipt = await this.prismaService.$transaction(async (prisma) => {
        const contract = await prisma.contracts.findUnique({
          where: { contractId: createReceiptDto.contractId },
        });

        if (!contract) {
          const satContract = await getContractGraphFromSat(
            createReceiptDto.contractId,
          );

          if (!satContract)
            throw new BadRequestException('Shartnoma SATdan topilmadi');

          const receipt = await prisma.receipts.create({
            data: {
              cashierId: userId,
              branchId,
              contractId: createReceiptDto.contractId,
              type: checkIsOldContract(satContract.inn) ? 'sale' : 'credit',
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
              personWhoSold: user.firstName + user.lastName,
            },
          });

          for await (const product of createReceiptDto.products) {
            if (!isUUID(product.productId))
              throw new BadRequestException(
                `ID: ${product.productId} uuid tipida emas!`,
              );

            const existProduct = await prisma.products.findUnique({
              where: { id: product.productId },
            });

            if (!existProduct)
              throw new BadRequestException(
                `Mahsulot topilmadi! Mahsulot id: ${product.productId}`,
              );

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

            await prisma.products.update({
              where: { id: product.productId },
              data: {
                count: {
                  decrement: product.count,
                },
              },
            });
          }

          return receipt;
        }

        const receiptExist = await prisma.receipts.findMany({
          where: { contractId: contract.contractId },
          orderBy: { createdAt: 'asc' },
        });

        const receiptType = receiptExist.length ? 'credit' : 'sale';
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
            personWhoSold: user.firstName + user.lastName,
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

      if (receipt.type === 'credit') {
        const written = await writeTransactionToSat({
          receivedCard: +createReceiptDto.card / 100,
          receivedCash: +createReceiptDto.cash / 100,
          contractid: receipt.contractId,
          user: `${user.firstName} ${user.lastName} ${user.middleName}`.trim(),
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
      } else {
        const contract = await this.prismaService.contracts.findUnique({
          where: { contractId: createReceiptDto.contractId },
        });

        if (!contract) {
          const written = await writeTransactionToSat({
            receivedCard: +createReceiptDto.card / 100,
            receivedCash: +createReceiptDto.cash / 100,
            contractid: receipt.contractId,
            user: `${user.firstName} ${user.lastName} ${user.middleName}`.trim(),
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
        }
      }

      return { data: receipt };
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

  async writePaymentSync(id: string, userId: string) {
    const receipt = await this.prismaService.receipts.findUnique({
      where: { id },
    });

    if (receipt.written || receipt.type === 'sale')
      throw new BadRequestException(
        "To'lov allaqachon yozilgan yoki bu chekni yoza olmaysiz!",
      );

    let user = await this.prismaService.users.findUnique({
      where: { id: receipt.cashierId },
    });

    if (!user.satId) {
      user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });
    }

    const written = await writeTransactionToSat({
      receivedCard: +receipt.card / 100,
      receivedCash: +receipt.cash / 100,
      contractid: receipt.contractId,
      user: `${user.firstName} ${user.lastName} ${user.middleName}`.trim(),
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

    return "To'lov yozildi";
  }

  async getSatPayments(prefix: string) {
    try {
      return await getSatPayments(prefix);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async refund(body: RefundReceiptDto, userId: string) {
    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
    });

    const written = await writeTransactionToSat({
      receivedCard: body.card,
      receivedCash: body.cash,
      contractid: body.contractId,
      user: `${user.firstName} ${user.lastName} ${user.middleName}`.trim(),
      userId: user.satId,
      comment: body.extraInfo,
      boshqa_id: body.paymentId,
    });

    if (!written)
      throw new Error(
        "SATga yozib bo'lmadi. To'lovni qayta yuborishni unutmang!",
      );

    const contract = await this.prismaService.contracts.findUnique({
      where: { contractId: body.contractId },
      include: {
        products: true,
      },
    });

    if (contract) {
      await this.prismaService.$transaction(async (prisma) => {
        for await (const product of contract.products) {
          try {
            await prisma.products.update({
              where: { id: product.productId },
              data: {
                count: { increment: product.count },
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
          } catch (err) {
            continue;
          }
        }
      });

      const receipt = await this.prismaService.receipts.findFirst({
        where: { contractId: body.contractId, type: 'sale' },
      });

      if (receipt) {
        await this.prismaService.receipts.update({
          where: { id: receipt.id },
          data: {
            type: 'refund',
          },
        });
      }
    }

    return 'To`lov qaytarildi';
  }
}
