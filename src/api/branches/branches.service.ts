import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createBranchDto: CreateBranchDto) {
    const isExist = await this.prismaService.branches.findUnique({
      where: { inn: createBranchDto.inn },
    })

    if (isExist) throw new BadRequestException('Bunday filial mavjud')

    return await this.prismaService.branches.create({
      data: createBranchDto
    })
  }

  async findAll(page: number, limit: number) {
    const count = await this.prismaService.branches.count();
    const data = await this.prismaService.branches.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      pageSize: limit,
      current: page,
      total: count,
    };
  }

  async findOne(id: string) {
    const branch = await this.prismaService.branches.findUnique({
      where: { id }
    })

    if (!branch) throw new BadRequestException('Filial topilmadi')

    return branch
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.findOne(id)

    return await this.prismaService.branches.update({
      where: { id: branch.id },
      data: updateBranchDto
    })
  }

  async remove(id: string) {
    const branch = await this.findOne(id)

    await this.prismaService.branches.delete({ where: { id: branch.id } })

    return 'Filial muvaffaqqiyatli o`chirildi'
  }
}
