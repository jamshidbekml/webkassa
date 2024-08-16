import { applyDecorators, Delete, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

export function CreateContract(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Create Contract' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          contractId: { type: 'string' },
          phone: { type: 'string' },
          pinfl: { type: 'string' },
          passportSeries: { type: 'string' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                count: { type: 'number' },
                amount: { type: 'number' },
                discountAmount: { type: 'number' },
                labels: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    }),
    Post(routeName),
  );
}

export function GetContracts(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Find Contracts' }),
    ApiQuery({ name: 'page', type: 'number', required: false }),
    ApiQuery({ name: 'limit', type: 'number', required: false }),
    ApiQuery({ name: 'search', type: 'string', required: false }),
    Get(routeName),
  );
}

export function GetContract(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Find Contract' }),
    ApiParam({ name: 'id', type: 'string' }),
    Get(routeName),
  );
}

export function DeleteContract(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Contract' }),
    ApiParam({ name: 'id', type: 'string' }),
    Delete(routeName),
  );
}
