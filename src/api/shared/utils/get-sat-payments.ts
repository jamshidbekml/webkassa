import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export async function getSatPayments(branchPrifix: string) {
  try {
    const config = new ConfigService();

    const token = Buffer.from(
      `${config.get('SAT_USERNAME')}:${config.get('SAT_PASSWORD')}`,
    ).toString('base64');

    const { data } = await axios.get<{ data: { id: number; name: string } }[]>(
      `https://kassa.payment-munis.uz/api/v1/clients/payments?branch=${branchPrifix}`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      },
    );

    return data[0].data;
  } catch (err) {
    throw new Error(`ERROR ON GET SAT PAYMENTS: ${err.message}`);
  }
}
