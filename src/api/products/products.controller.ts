import { Body, Controller, Param, Query, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NestedSerialize } from '../interceptors/nested-serialize.interceptor';
import { ProductsResDto } from './dto/products.dto';
import { Request } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import {
  AddLabel,
  CreateProduct,
  DeleteLabel,
  FindAll,
  FindAllBlack,
  GetOneProduct,
  UpdateProduct,
} from './decorators/products.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateLabelDto } from './dto/create-label.dto';

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
    @Query('status') status?: 'active' | 'inactive',
  ) {
    const { branchId } = req['user'] as { branchId: string };
    return this.productsService.findAllBlack(
      +page,
      +limit,
      branchId,
      search,
      status,
    );
  }

  @CreateProduct('manual')
  createManual(@Req() req: Request, @Body() body: CreateProductDto) {
    const { branchId } = req['user'] as { branchId: string };
    return this.productsService.createManual(body, branchId);
  }

  @DeleteLabel('label/:id')
  removeLabel(@Param('id') id: string) {
    return this.productsService.deleteLabel(id);
  }

  @AddLabel('label/:id')
  addLabel(@Param('id') id: string, @Body() { label }: CreateLabelDto) {
    return this.productsService.addLabel(id, label);
  }

  @UpdateProduct(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @GetOneProduct(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productsService.remove(+id);
  // }
}
