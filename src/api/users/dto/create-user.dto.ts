import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ROLE } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: `Field to enter username`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: `Field to enter user's password`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: `Field to enter user's name`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: `Field to enter user's name`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: `Field to enter user's name`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  middleName: string;

  @ApiProperty({
    description: `Field to enter user's role`,
    enum: ROLE,
    default: 'cashier',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(ROLE)
  role?: ROLE;

  @ApiProperty({ description: `Field to enter user's branch` })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  branchId: string;
}
