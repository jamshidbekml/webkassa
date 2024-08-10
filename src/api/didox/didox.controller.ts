import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { DidoxService } from './didox.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiBearerAuth()
@ApiTags('didox')
@Controller('didox')
export class DidoxController {
  constructor(private readonly didoxService: DidoxService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  getAllDocuments(@Req() req: Request, @Query('page') page = 1) {
    const obj = req['user'] as { inn: string };

    if (!obj?.inn)
      throw new BadRequestException('Foydalanuvchu mchj raqami mavjud emas!');
    return this.didoxService.findAllDocuments(page, obj.inn);
  }

  @Get(':doc_id')
  @ApiOperation({ summary: 'Get one document' })
  @ApiParam({ name: 'doc_id', type: String })
  getOneDocument(@Req() req: Request, @Param('doc_id') doc_id: string) {
    const obj = req['user'] as { inn: string };
    if (!obj?.inn)
      throw new BadRequestException('Foydalanuvchu mchj raqami mavjud emas!');
    return this.didoxService.findOneDocument(obj.inn, doc_id);
  }
}
