import { PAYMENT_TYPE, RECEIPT_TYPE } from '@prisma/client';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateReceiptDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  cTin: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  cName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  tAmount: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  tVat: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  saleId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(RECEIPT_TYPE)
  type: RECEIPT_TYPE;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  createdAt?: Date;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  payments: { amount: number; paymentType: PAYMENT_TYPE }[];
}

export class CreatePaymentDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(PAYMENT_TYPE)
  type: PAYMENT_TYPE;
}
