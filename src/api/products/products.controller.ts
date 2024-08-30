import { Body, Controller, Query, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NestedSerialize } from '../interceptors/nested-serialize.interceptor';
import { ProductsResDto } from './dto/products.dto';
import { Request } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import {
  CreateProduct,
  FindAll,
  FindAllBlack,
} from './decorators/products.decorator';

@ApiBearerAuth()
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @FindAll()
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

  @FindAllBlack('black')
  @NestedSerialize(ProductsResDto)
  findAllBlack(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const { branchId } = req['user'] as { branchId: string };
    return this.productsService.findAllBlack(+page, +limit, branchId, search);
  }

  @CreateProduct('manual')
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
