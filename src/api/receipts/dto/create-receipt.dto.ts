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

class ProductDto {
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  count: number;

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
  barcode: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  vatPercent: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  vat: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  packageCode: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  classCode: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  label?: string;
}

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
  @IsString()
  contractId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  products: ProductDto[];

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
