import { Controller, Req, Body, Query, Param } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { Request } from 'express';
import {
  CreateReceipt,
  GetAllReceipts,
  GetReceipt,
} from './decorators/receipts.decorator';
import { RECEIPT_TYPE } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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

  @GetReceipt(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOneReceipt(id);
  }
}
