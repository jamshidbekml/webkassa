import { Controller, Get, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NestedSerialize } from '../interceptors/nested-serialize.interceptor';
import { CategoriesResDto } from './dto/categories.dto';
import { Request } from 'express';

@ApiBearerAuth()
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @NestedSerialize(CategoriesResDto)
  findAll(@Req() req: Request) {
    const { branchId } = req['user'] as { branchId: string };
    return this.categoriesService.findAll(branchId);
  }
}
