import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({ description: `Field to enter label name`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  label: string;
}
