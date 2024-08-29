import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_TYPE } from '@prisma/client';
import axios from 'axios';

export async function writeTransactionToSat(payload: {
  contractid: string;
  type: PAYMENT_TYPE;
  amount: number;
  userId: number;
  user: string;
}) {
  try {
    const config = new ConfigService();
    const {
      data: { success },
    } = await axios.post<{ success: boolean }>(
      `${config.get('SAT_URL')}/api/v1/clients/payment`,
      {
        branch: payload.contractid.split('_')[0].toLowerCase(),
        shraqam: payload.contractid,
        amount: payload.amount,
        naqd: payload.type === 'Cash' ? true : false,
        plastik: payload.type === 'Cashless' ? true : false,
      },
    );

    if (!success) {
      throw new BadRequestException('SAT transaction error');
    }
    return success;
  } catch (err) {
    throw new BadRequestException(err.message);
  }
}
