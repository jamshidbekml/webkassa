import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefundReceiptDto {
  @ApiProperty({ description: `SHRAQAM`, required: true, example: 'Q_30334' })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  contractId: string;

  @ApiProperty({
    description: `Kommentariya`,
    required: true,
    example: "shartnoma atmen bo'ldi, mahsulot yoqmadi",
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  extraInfo: string;

  @ApiProperty({
    description: "Sat to'lovlaridan birining ID'si",
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  paymentId: number;

  @ApiProperty({
    description: "To'lov summasi",
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: "To'lov summasi",
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  cash: number;

  @ApiProperty({
    description: "To'lov summasi",
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  card: number;
}
