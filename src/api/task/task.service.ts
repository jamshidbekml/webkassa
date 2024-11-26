import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import { getDidoxToken } from '../shared/utils/get-didox-token';
import { join } from 'path';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(private readonly prismaService: PrismaService) {}
  onModuleInit() {
    this.tokenUpdater();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tokenUpdater() {
    try {
      const warehouses = await this.prismaService.branches.findMany();

      const tokens = {};
      for await (const warehouse of warehouses) {
        const token = await getDidoxToken(warehouse.inn, warehouse.password);

        tokens[warehouse.inn] = token;
      }

      for (const token in tokens) {
        const existingToken = await this.prismaService.tokens.findUnique({
          where: { inn: token },
        });

        if (existingToken) {
          await this.prismaService.tokens.update({
            where: {
              id: existingToken.id,
            },
            data: {
              token: tokens[token],
            },
          });
        } else {
          await this.prismaService.tokens.create({
            data: {
              inn: token,
              token: tokens[token],
            },
          });
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  }
}
