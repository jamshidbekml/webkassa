import { Module, OnModuleInit } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/accessToken.guard';
import { RolesGuard } from './auth/guards/role.guard';
import { ConfigModule } from '@nestjs/config';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { TaskModule } from './task/task.module';
import { DidoxModule } from './didox/didox.module';
import { ContractsModule } from './contracts/contracts.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminalsModule } from './terminals/terminals.module';
import { ExcelModule } from './excel/excel.module';
import { ExcelService } from './excel/excel.service';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    AuthModule,
    BranchesModule,
    ProductsModule,
    CategoriesModule,
    UsersModule,
    PrismaModule,
    TaskModule,
    DidoxModule,
    ContractsModule,
    ReceiptsModule,
    TerminalsModule,
    ExcelModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class ApiModule implements OnModuleInit {
  constructor(
    private readonly exelService: ExcelService,
    private readonly prismaService: PrismaService,
  ) {}
  async onModuleInit() {
    const { Лист1: data } = this.exelService.convertExcelToJson(
      join(__dirname, '..', '..', '..', 'products.xlsx'),
    );

    const newData: {
      name: string;
      catalogcode: string;
      packagecode: string;
      count: number;
      barcode: string;
      vat: number;
    }[] = data.map((e) => ({
      name: e.махсулотноми,
      catalogcode: e.МИХК.slice(0, 17),
      packagecode: e.Упаковка.slice(-7),
      count: 50,
      barcode: '',
      vat: 12,
    }));

    for await (const product of newData) {
      await this.prismaService.products.create({
        data: { ...product, branchId: '', categoryId: '' },
      });
    }
  }
}
