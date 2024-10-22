import { Controller, Req, Body, Query, Param } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { Request } from 'express';
import {
  CreateReceipt,
  GetAllReceipts,
  GetPaymentTypes,
  GetReceipt,
  RefundReceipt,
  WritePaymentSync,
} from './decorators/receipts.decorator';
import { RECEIPT_TYPE } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RefundReceiptDto } from './dto/update-receipt.dto';

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

  @GetPaymentTypes('payment-types')
  getPaymentTypes(@Req() req: Request) {
    const { prefix } = req['user'] as { prefix: string };

    return this.receiptsService.getSatPayments(prefix);
  }

  @RefundReceipt('refund')
  refund(@Body() body: RefundReceiptDto, @Req() req: Request) {
    const { sub } = req['user'] as { sub: string };

    return this.receiptsService.refund(body, sub);
  }

  @WritePaymentSync('write/:id')
  writePaymentSync(@Req() req: Request, @Param('id') id: string) {
    const { sub } = req['user'] as { sub: string };
    return this.receiptsService.writePaymentSync(id, sub);
  }

  @GetReceipt(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOneReceipt(id);
  }
}
