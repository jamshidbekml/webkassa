import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GetAllDocumentsFromDidox } from '../interfaces/didox.interface';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/api/prisma/prisma.service';

export async function getDidoxDocuments(inn: string, page: number) {
  try {
    const configService = new ConfigService();
    const prismaService = new PrismaService();
    const user_key = await prismaService.tokens
      .findUnique({ where: { inn } })
      .then((res) => res.token);

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

    return data.data;
  } catch (err) {
    console.log(err);
    throw new BadRequestException(
      `ERROR ON GET DIDOX DOCUMENTS: ${err.message}`,
    );
  }
}
