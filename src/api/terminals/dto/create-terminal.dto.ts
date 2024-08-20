import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTerminalDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  address?: string;
}
