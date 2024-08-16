import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { Request } from 'express';
import { ApiOperation } from '@nestjs/swagger';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Req() req: Request, @Body() createContractDto: CreateContractDto) {
    const { branchId } = req['user'] as { branchId: string };
    return this.contractsService.create(createContractDto, branchId);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const { branchId } = req['user'] as { branchId: string };
    return this.contractsService.findAll(branchId, +page, +limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}
