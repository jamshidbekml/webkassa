import { RECEIPT_TYPE } from '@prisma/client';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReceiptDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  terminalId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberString()
  receiptSeq: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberString()
  fiscalSign: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberString()
  dateTime: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  qrCodeURL: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  companyAddress: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  companyINN: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  staffName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  clientName: string;

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
  payments?: { amount: number; receivedCard: number; receivedCash: number };

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  products?: { productId: string; count: number }[];
}

export class CreatePaymentDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  receivedCash: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  receivedCard: number;
}
