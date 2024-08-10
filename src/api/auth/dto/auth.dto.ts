import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
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
}

export class GetMeDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  name: string;

  @Expose()
  role: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  @Transform(
    ({ value }) =>
      value
        ? value.map((ub) => {
            return {
              id: ub.branch.id,
              name: ub.branch.name,
            };
          })
        : [],
    {
      toClassOnly: true,
    },
  )
  branches: any;
}
