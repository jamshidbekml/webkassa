import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export async function writeTransactionToSat(payload: {
  contractid: string;
  receivedCard: number;
  receivedCash: number;
  userId: number;
  user: string;
}) {
  try {
    const config = new ConfigService();
    const token = Buffer.from(
      `${config.get('SAT_USERNAME')}:${config.get('SAT_PASSWORD')}`,
    ).toString('base64');

    const {
      data: { success },
    } = await axios.post<{ success: boolean }>(
      `${config.get('SAT_URL')}/api/v1/clients/payment`,
      {
        branch: payload.contractid.split('_')[0].toLowerCase(),
        shraqam: payload.contractid,
        naqd: payload.receivedCash,
        plastik: payload.receivedCard,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!success) {
      return false;
    }

    return true;
  } catch (err) {
    // throw new BadRequestException(err.message);
    return false;
  }
}
