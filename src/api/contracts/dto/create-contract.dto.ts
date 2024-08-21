import { IsArray, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateContractDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsDefined()
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
    labels?: string[];
  }[];
}
