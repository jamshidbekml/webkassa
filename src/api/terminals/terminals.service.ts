import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TerminalsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTerminalDto: CreateTerminalDto, branchId: string) {
    const terminal = await this.prismaService.terminals.create({
      data: {
        ...createTerminalDto,
        branchId,
      },
    });

    return { data: terminal };
  }

  async findAll(branchId: string) {
    const terminals = await this.prismaService.terminals.findMany({
      where: { branchId },
    });

    return { data: terminals };
  }

  async update(id: string, updateTerminalDto: UpdateTerminalDto) {
    const terminal = await this.prismaService.terminals.findUnique({
      where: { id },
    });

    if (!terminal) throw new NotFoundException('Terminal topilmadi');

    const data = await this.prismaService.terminals.update({
      where: { id },
      data: updateTerminalDto,
    });

    return { data };
  }

  async remove(id: string) {
    const terminal = await this.prismaService.terminals.findUnique({
      where: { id },
    });

    if (!terminal) throw new NotFoundException('Terminal topilmadi');

    await this.prismaService.terminals.delete({ where: { id } });
    return 'Terminal o`chirildi';
  }
}
