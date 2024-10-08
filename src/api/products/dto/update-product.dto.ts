import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  packagecode?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  vat?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  count?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  catalogcode?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  barcode?: string;
}
