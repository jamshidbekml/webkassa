import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  barcode: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  packagecode: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  vat: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  discountAmount?: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  count: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  branchId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  catalogcode: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  lables?: string[];
}
