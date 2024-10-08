import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export async function getContractGraphFromSat(contractId: string) {
  try {
    const config = new ConfigService();
    const token = Buffer.from(
      `${config.get('SAT_USERNAME')}:${config.get('SAT_PASSWORD')}`,
    ).toString('base64');

    const { data } = await axios.get<{
      grafik: {
        nomer: number;
        sana: string;
        summa: number;
        tulov: number;
        qoldiq: number;
        yopildi: boolean;
      }[];
      tulov: {
        id: number;
        sana: string;
        naqd: number;
        plastik: number;
        boshqa_nomi: string;
        boshqa: number;
        chegirma: number;
        bonus_naqd: number;
        bonus_plastik: number;
        bonus_jami: number;
        tasdiqlandi: number;
        tasdiqladi: string;
      }[];
    }>(
      `${config.get('SAT_URL')}/api/v1/clients/contracts?branch=${contractId.split('_')[0].toLowerCase()}&shraqam=${contractId}`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      },
    );

    console.log(data);

    return data;
  } catch (err) {
    throw new BadRequestException(err.message);
  }
}
