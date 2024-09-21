import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: `Field to enter product name`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: `Field to enter product packagecode`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  packagecode: string;

  @ApiProperty({
    description: `Field to enter product vat`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  vat: number;

  @ApiProperty({
    description: `Field to enter product price`,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  amount?: number;

  @ApiProperty({
    description: `Field to enter product discount`,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({
    description: `Field to enter product count`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  count: number;

  // @ApiProperty({
  //   description: `Field to enter product branchId`,
  //   required: true,
  // })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  branchId: string;

  @ApiProperty({
    description: `Field to enter product category`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: `Field to enter product catalogcode`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  catalogcode: string;

  @ApiProperty({
    description: `Field to enter product lables`,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  lables?: string[];
}
