import { applyDecorators, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PAYMENT_TYPE, RECEIPT_TYPE } from '@prisma/client';

export function CreateReceipt(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Create receipt' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          cTin: { type: 'string' },
          cName: { type: 'string' },
          tAmount: { type: 'string' },
          tVat: { type: 'string' },
          saleId: { type: 'string' },
          contractId: { type: 'string' },
          createdAt: { type: 'date' },
          type: { type: 'enum', example: RECEIPT_TYPE },
          payments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                amount: { type: 'number' },
                type: { type: 'enum', example: PAYMENT_TYPE },
              },
            },
          },
          products: {
            type: 'array',
            properties: {
              productId: { type: 'string' },
              count: { type: 'number' },
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
    ApiParam({ name: 'saleId', type: 'string' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          amount: { type: 'number' },
          type: { type: 'enum', example: PAYMENT_TYPE },
        },
      },
    }),
    Post(routeName),
  );
}

export function GetAllPayments(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Get all payments' }),
    ApiQuery({ name: 'type', required: true, enum: PAYMENT_TYPE }),
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
