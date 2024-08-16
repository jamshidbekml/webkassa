import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GetAllDocumentsFromDidox } from '../interfaces/didox.interface';
import { BadRequestException } from '@nestjs/common';

export async function getDidoxDocuments(inn: string, page: number) {
  try {
    const configService = new ConfigService();
    const user_key = configService.get(inn);

    const partnet_token = configService.get('DIDOX_TOKEN');

    const data = await axios.get<GetAllDocumentsFromDidox>(
      `https://api-partners.didox.uz/v2/documents?owner=0&limit=20&page=${page}`,
      {
        headers: {
          'user-key': user_key,
          'Partner-Authorization': partnet_token,
        },
      },
    );
    console.log(data);

    return data.data;
  } catch (err) {
    throw new BadRequestException(
      `ERROR ON GET DIDOX DOCUMENTS: ${err.message}`,
    );
  }
}
