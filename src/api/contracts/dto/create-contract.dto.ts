import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
  secondPhone: string;

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
  products: {
    productId: string;
    count: number;
    amount: number;
    discountAmount: number;
    label?: string;
    vat: number;
  }[];
}
