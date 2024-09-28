import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsNotEmpty, IsString } from "class-validator"

export class CreateBranchDto {
    @ApiProperty({ description: `Field to enter branch inn`, required: true })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    inn: string

    @ApiProperty({ description: `Field to enter branch name`, required: true })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string

    @ApiProperty({ description: `Field to enter branch token`, required: true })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    token: string

    @ApiProperty({ description: `Field to enter branch password`, required: true })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    password: string

    @ApiProperty({
        description: `Field to enter branch company name`,
        required: true,
    })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    companyAddress: string

    @ApiProperty({ description: `Field to enter branch prefix`, required: true })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    prefix: string
}
