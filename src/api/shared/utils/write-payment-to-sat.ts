import { BadRequestException } from '@nestjs/common';
import { PAYMENT_TYPE } from '@prisma/client';

export async function writeTransactionToSat(payload: {
  branch: string;
  contractid: string;
  type: PAYMENT_TYPE;
  amount: number;
  userId: number;
  user: string;
  comment: string;
}) {
  try {
  } catch (err) {
    throw new BadRequestException(err.message);
  }
}
