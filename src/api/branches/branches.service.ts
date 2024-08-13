import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createBranchDto: CreateBranchDto) {
    return 'This action adds a new branch';
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

  findOne(id: number) {
    return `This action returns a #${id} branch`;
  }

  update(id: number, updateBranchDto: UpdateBranchDto) {
    return `This action updates a #${id} branch`;
  }

  remove(id: number) {
    return `This action removes a #${id} branch`;
  }
}
