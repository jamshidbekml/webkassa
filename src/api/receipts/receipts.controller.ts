import { Controller, Req, Body, Query, Param } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { Request } from 'express';
import {
  AddPayment,
  CreateReceipt,
  GetAllReceipts,
  GetReceipt,
} from './decorators/receipts.decorator';
import { RECEIPT_TYPE } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetReceiptsDto } from './dto/receips.dto';
import { NestedSerialize } from '../interceptors/nested-serialize.interceptor';

@ApiBearerAuth()
@ApiTags('receipts')
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @CreateReceipt()
  create(@Req() req: Request, @Body() createReceiptDto: CreateReceiptDto) {
    const { branchId, sub } = req['user'] as { branchId: string; sub: string };
    return this.receiptsService.create(createReceiptDto, sub, branchId);
  }

  @GetAllReceipts()
  @NestedSerialize(GetReceiptsDto)
  findAll(
    @Req() req: Request,
    @Query('type') type: RECEIPT_TYPE,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('from')
    from?: Date,
    @Query('to') to?: Date,
  ) {
    const { branchId } = req['user'] as { branchId: string };
    return this.receiptsService.findAll(
      branchId,
      type,
      +page,
      +limit,
      search,
      from,
      to,
    );
  }

  @AddPayment('add/:id')
  addPayment(
    @Req() req: Request,
    @Param('id') saleId: string,
    @Body() body: CreateReceiptDto,
  ) {
    const { branchId, sub } = req['user'] as { branchId: string; sub: string };
    return this.receiptsService.createPayment(body, sub, branchId);
  }

  @GetReceipt(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOneReceipt(id);
  }
}
