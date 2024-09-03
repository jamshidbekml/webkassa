import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { isUUID } from '../shared/utils/uuid-checker';
import { ROLE } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUserDto) {
    const isExist = await this.prismaService.users.findUnique({
      where: {
        username: data.username,
      },
    });

    if (isExist) throw new BadRequestException('User already exists');
    data.password = await argon2.hash(data.password);
    const user = await this.prismaService.users.create({
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data: user, message: 'User created successfully', success: true };
  }

  async findByUsername(username: string) {
    const user = await this.prismaService.users.findUnique({
      where: { username },
      include: {
        branch: true,
      },
    });

    return user;
  }

  async findByid(id: string) {
    const isExist = await this.prismaService.users.findUnique({
      where: { id },
    });
    if (!isExist) throw new NotFoundException();

    const user = await this.prismaService.users.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        refreshToken: true,
      },
    });

    return {
      data: user,
      success: true,
    };
  }

  async update(id: string, data: UpdateUserDto, role: ROLE) {
    if (!isUUID(id))
      throw new BadRequestException('Foydalanuvchi id`si uuid tipida emas!');
    const isExist = await this.prismaService.users.findUnique({
      where: { id },
    });

    if (!isExist) throw new NotFoundException();
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }

    if (data?.role && role !== 'superadmin')
      throw new BadRequestException('You are not allowed to update role');

    const user = await this.prismaService.users.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        branch: true,
      },
    });

    return {
      data: user,
      message: 'User updated successfully',
      success: true,
    };
  }

  async delete(id: string) {
    const isExist = await this.prismaService.users.findUnique({
      where: { id },
    });

    if (!isExist) throw new NotFoundException();

    const data = await this.prismaService.users.delete({
      where: {
        id,
      },
    });

    return {
      data,
      message: 'User deleted successfully',
    };
  }

  async findAll(page: number, limit: number, search?: string) {
    const users = await this.prismaService.users.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { middleName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await this.prismaService.users.count({
      where: {
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { middleName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    });

    return {
      data: users,
      pageSize: limit,
      current: page,
      total,
    };
  }
}
