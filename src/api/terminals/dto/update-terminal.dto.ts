import { PartialType } from '@nestjs/swagger';
import { CreateTerminalDto } from './create-terminal.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTerminalDto extends PartialType(CreateTerminalDto) {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  login?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  password?: string;
}
