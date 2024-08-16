import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export async function getContractProductsFromSat(contractId: string) {
  try {
    const config = new ConfigService();
    const token = Buffer.from(
      `${config.get('SAT_USERNAME')}:${config.get('SAT_PASSWORD')}`,
    ).toString('base64');
    const data = await axios.get<{
      products: { name: string; price: number; count: number }[];
      bonus: { name: string; price: number; count: number }[];
    }>(
      `${config.get('SAT_URL')}/api/v1/clients/products?branch=${contractId.split('_')[0].toLowerCase()}&contractid=${contractId}`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      },
    );

    console.log(data);

    return data.data;
  } catch (err) {
    console.log(err);

    throw new BadRequestException(err.message);
  }
}
