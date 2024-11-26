import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IDocument } from '../interfaces/didox.interface';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/api/prisma/prisma.service';

export async function getOneDocument(inn: string, doc_id: string) {
  try {
    const configService = new ConfigService();
    const prismaService = new PrismaService();
    const user_key = await prismaService.tokens
      .findUnique({ where: { inn } })
      .then((res) => res.token);

    const partnet_token = configService.get('DIDOX_TOKEN');

    const data = await axios.get<IDocument>(
      `https://api-partners.didox.uz/v1/documents/${doc_id}?owner=0`,
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
      `ERROR ON GET ONE DIDOX DOCUMENT: ${err.message}`,
    );
  }
}
