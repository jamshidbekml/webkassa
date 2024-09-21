import { Module } from '@nestjs/common';
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
import { ExcelModule } from './excel/excel.module';

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
    ExcelModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class ApiModule {}
