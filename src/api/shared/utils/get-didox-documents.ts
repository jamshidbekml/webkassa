import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GetAllDocumentsFromDidox } from '../interfaces/didox.interface';

export async function getDidoxDocuments(inn: string, page: number) {
  try {
    const configService = new ConfigService();
    const user_key = configService.get(inn);
    console.log(user_key);

    const partnet_token = configService.get('DIDOX_TOKEN');
    console.log(partnet_token);

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
    console.log(err.message);
  }
}
