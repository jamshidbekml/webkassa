import { Controller, Body, Param, Req, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { Request } from 'express';
import {
  CreateContract,
  DeleteContract,
  GetContract,
  GetContracts,
} from './docorators/contract.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @CreateContract()
  create(@Req() req: Request, @Body() createContractDto: CreateContractDto) {
    const { branchId } = req['user'] as { branchId: string };
    return this.contractsService.create(createContractDto, branchId);
  }

  @GetContracts()
  findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const { branchId } = req['user'] as { branchId: string };
    return this.contractsService.findAll(branchId, page, limit, search);
  }

  @GetContract(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @DeleteContract(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}
