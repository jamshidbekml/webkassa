import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
    @ApiProperty({ description: `Field to enter branch inn`, required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    inn?: string;

    @ApiProperty({ description: `Field to enter branch name`, required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?: string;

    @ApiProperty({ description: `Field to enter branch token`, required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    token?: string;

    @ApiProperty({ description: `Field to enter branch password`, required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    password?: string;
}
