import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
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
  @IsUUID('4')
  contractId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  payments?: { amount: number; receivedCard: number; receivedCash: number };

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  products?: {
    productId: string;
    count: number;
    amount: number;
    discountAmount: number;
    barcode: string;
    vatPercent: number;
    vat: number;
    name: string;
    packageCode: string;
    classCode: string;
    label?: string;
  }[];

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  received: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  cash: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  card: number;
}
