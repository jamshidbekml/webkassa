import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  // Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NestedSerialize } from '../interceptors/nested-serialize.interceptor';
import { ProductsResDto } from './dto/products.dto';
import { Request } from 'express';
import { CreateProductDto } from './dto/create-product.dto';

@ApiBearerAuth()
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Post()
  // create(@Body() createProductDto: CreateProductDto) {
  //   return this.productsService.create(createProductDto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'label', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @NestedSerialize(ProductsResDto)
  findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('label') label?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const { branchId } = req['user'] as { branchId: string };
    return this.productsService.findAll(
      +page,
      +limit,
      branchId,
      search,
      categoryId,
      label,
    );
  }

  @Post('manual')
  @ApiOperation({ summary: 'Create product manually' })
  createManual(@Req() req: Request, @Body() body: CreateProductDto) {
    const { branchId } = req['user'] as { branchId: string };
    return this.productsService.createManual(body, branchId);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  //   return this.productsService.update(+id, updateProductDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productsService.remove(+id);
  // }
}
