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

  @Cron(CronExpression.EVERY_3_HOURS)
  async tokenUpdater() {
    try {
      const warehouses = await this.prismaService.branches.findMany();

      const tokens = {};
      for await (const warehouse of warehouses) {
        const token = await getDidoxToken(warehouse.inn, warehouse.password);

        tokens[warehouse.inn] = token;
      }

      const envFilePath = join(__dirname, '..', '..', '..', '..', '.env');

      let data = await fs.readFile(envFilePath, 'utf8');

      for (const token in tokens) {
        const keyExists = data
          .split('\n')
          .some((line) => line.startsWith(`${token}=`));

        if (keyExists) {
          data = data
            .split('\n')
            .map((line) => {
              if (line.startsWith(`${token}=`)) {
                return `${token}=${tokens[token]}`;
              }
              return line;
            })
            .join('\n');
        } else {
          data = `${data}\n${token}=${tokens[token]}`;
        }
      }

      await fs.writeFile(envFilePath, data);
    } catch (err) {
      console.log(err.message);
    }
  }
}
