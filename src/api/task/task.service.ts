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
    this.ikpuAdder();
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

      console.log(tokens);

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

  async ikpuAdder() {
    await this.prismaService.productMarks.create({
      data: {
        productId: '4aa41354-25ff-4cf7-8d27-8461bf0fa390',
        label: '9789943731936',
      },
    });

    await this.prismaService.productMarks.create({
      data: {
        productId: '4aa41354-25ff-4cf7-8d27-8461bf0fa390',
        label: '40099064',
      },
    });

    await this.prismaService.productMarks.create({
      data: {
        productId: 'dc755510-127a-4086-b972-62a5b3d90e3f',
        label: '9789943731936',
      },
    });

    await this.prismaService.productMarks.create({
      data: {
        productId: 'dc755510-127a-4086-b972-62a5b3d90e3f',
        label: '40099064',
      },
    });
  }
}
