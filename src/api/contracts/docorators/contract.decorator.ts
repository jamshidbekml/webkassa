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
          clientFullName: { type: 'string' },
          phone: { type: 'string' },
          secondPhone: { type: 'string' },
          pinfl: { type: 'string' },
          passportSeries: { type: 'string' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                amount: { type: 'number', description: 'mahsulot narxi' },
                discountAmount: {
                  type: 'number',
                  description: 'chegirma narxi',
                },
                label: { type: 'string' },
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

export function GetContractProducts(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Get Contract Products From Sat' }),
    ApiParam({ name: 'contractId', type: 'string' }),
    Get(routeName),
  );
}

export function GetContractGraph(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Get Contract Graph From Sat' }),
    ApiParam({ name: 'contractId', type: 'string' }),
    Get(routeName),
  );
}
