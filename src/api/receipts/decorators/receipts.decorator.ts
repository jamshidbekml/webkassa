import { applyDecorators, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RECEIPT_TYPE } from '@prisma/client';

export function CreateReceipt(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Create receipt' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          contractId: { type: 'string', example: 'KSFBKSbfAKEJFkKSVBKASB' },
          receiptSeq: { type: 'string', example: '4029' },
          dateTime: { type: 'string', example: '20240921104935' },
          fiscalSign: { type: 'string', example: '252932444458' },
          terminalId: { type: 'string', example: 'UZ191211501034' },
          qrCodeURL: {
            type: 'string',
            example:
              'https://ofd.soliq.uz/check?t=UZ191211501034&r=4029&c=20240921104935&s=252932444458',
          },
          companyName: { type: 'string', example: 'Munis Savdo MCHJ' },
          companyAddress: {
            type: 'string',
            example:
              'argona viloyati,Quvasoy sh.,Muyan MFY, Boshkoprik kochasi',
          },
          companyINN: { type: 'string', example: '311020483' },
          phoneNumber: { type: 'string', description: 'Mijoz telefon raqami' },
          clientName: { type: 'string', description: 'Mijoj ismi' },
          staffName: { type: 'string', description: 'Kassir ismi' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                count: { type: 'number' },
              },
            },
          },
        },
      },
    }),
    Post(routeName),
  );
}

export function GetAllReceipts(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Get all receipts' }),
    ApiQuery({ name: 'type', required: true, enum: RECEIPT_TYPE }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'search', required: false, type: 'string' }),
    ApiQuery({
      name: 'from',
      required: false,
      description: 'filtering with date, default current day',
    }),
    ApiQuery({
      name: 'to',
      required: false,
      description: 'filtering with date, default current day',
    }),
    Get(routeName),
  );
}

export function GetReceipt(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Find receipt' }),
    ApiParam({ name: 'id', type: 'string' }),
    Get(routeName),
  );
}

export function AddPayment(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Add payment' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          contractId: { type: 'string', example: 'lasnflksNCksdbgklfsNlasnv' },
          receiptSeq: { type: 'string', example: '4029' },
          dateTime: { type: 'string', example: '20240921104935' },
          fiscalSign: { type: 'string', example: '252932444458' },
          terminalId: { type: 'string', example: 'UZ191211501034' },
          qrCodeURL: {
            type: 'string',
            example:
              'https://ofd.soliq.uz/check?t=UZ191211501034&r=4029&c=20240921104935&s=252932444458',
          },
          companyName: { type: 'string', example: 'Munis Savdo MCHJ' },
          companyAddress: {
            type: 'string',
            example:
              'argona viloyati,Quvasoy sh.,Muyan MFY, Boshkoprik kochasi',
          },
          companyINN: { type: 'string', example: '311020483' },
          phoneNumber: { type: 'string', description: 'Mijoz telefon raqami' },
          clientName: { type: 'string', description: 'Mijoj ismi' },
          staffName: { type: 'string', description: 'Kassir ismi' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                count: { type: 'number' },
              },
            },
          },
        },
      },
    }),
    Post(routeName),
  );
}
