import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

class ProductDto {
  @IsDefined()
  @IsNotEmpty()
  @IsUUID('4')
  productId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  label?: string;
}

export class CreateContractDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  secondPhone?: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  clientFullName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  passportSeries: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  pinfl: string;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  products: ProductDto[];
}
