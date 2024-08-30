import { applyDecorators, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';

export function CreateProduct(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Create product manually' }),
    ApiBody({ type: CreateProductDto }),
    Post(routeName),
  );
}

export function FindAll(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Get all products' }),
    ApiQuery({ name: 'categoryId', type: String, required: false }),
    ApiQuery({ name: 'search', type: String, required: false }),
    ApiQuery({ name: 'label', type: String, required: false }),
    ApiQuery({ name: 'page', type: Number, required: false, example: 1 }),
    ApiQuery({ name: 'limit', type: Number, required: false, example: 10 }),
    Get(routeName),
  );
}

export function FindAllBlack(routeName?: string) {
  return applyDecorators(
    ApiOperation({ summary: 'Get all products' }),
    ApiQuery({ name: 'categoryId', type: String, required: false }),
    ApiQuery({ name: 'search', type: String, required: false }),
    ApiQuery({ name: 'page', type: Number, required: false, example: 1 }),
    ApiQuery({ name: 'limit', type: Number, required: false, example: 10 }),
    Get(routeName),
  );
}
