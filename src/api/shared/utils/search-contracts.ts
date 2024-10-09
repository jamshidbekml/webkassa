import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export async function searchContractssFromSat(
  branch: string,
  search: string,
  limit: number,
) {
  try {
    const config = new ConfigService();
    const token = Buffer.from(
      `${config.get('SAT_USERNAME')}:${config.get('SAT_PASSWORD')}`,
    ).toString('base64');
    const { data } = await axios.get<{
      data: {
        fio: string;
        phone1: string;
        phone2: string;
        passport: string;
        pnfl: string;
        shraqam: string;
        yopildi: boolean;
        sana: string;
      }[];
    }>(
      `${config.get('SAT_URL')}/api/v1/clients/search?branch=${branch}&limit=${limit}&search=${search}`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      },
    );

    return data.data;
  } catch (err) {
    console.log(err);

    throw new BadRequestException(err.message);
  }
}
