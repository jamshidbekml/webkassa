import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { TerminalsService } from './terminals.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('terminals')
@Controller('terminals')
export class TerminalsController {
  constructor(private readonly terminalsService: TerminalsService) {}

  @ApiOperation({ summary: 'Create terminal' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string' },
        password: { type: 'string' },
        address: { type: 'string' },
      },
      required: ['login', 'password'],
    },
  })
  @Post()
  create(@Req() req: Request, @Body() createTerminalDto: CreateTerminalDto) {
    const { branchId } = req['user'] as { branchId: string };
    return this.terminalsService.create(createTerminalDto, branchId);
  }

  @ApiOperation({ summary: 'Get all terminals' })
  @Get()
  findAll(@Req() req: Request) {
    const { branchId } = req['user'] as { branchId: string };
    return this.terminalsService.findAll(branchId);
  }

  @ApiOperation({ summary: 'Update terminal' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string' },
        password: { type: 'string' },
        address: { type: 'string' },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'string', required: true })
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTerminalDto: UpdateTerminalDto,
  ) {
    return this.terminalsService.update(id, updateTerminalDto);
  }

  @ApiOperation({ summary: 'Remove terminal' })
  @ApiParam({ name: 'id', type: 'string', required: true })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.terminalsService.remove(id);
  }
}
