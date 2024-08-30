import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ROLE } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: `Field to enter username` })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  username?: string;

  @ApiProperty({ description: `Field to enter user's password` })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  password?: string;

  @ApiProperty({ description: `Field to enter user's name` })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: `Field to enter user's name` })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: `Field to enter user's name` })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  refreshToken?: string;

  @ApiProperty({ description: `Field to enter user's role` })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(ROLE)
  role?: ROLE;

  @ApiProperty({ description: `Field to enter user's branch` })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  branchId?: string;
}
