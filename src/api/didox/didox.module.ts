import { Module } from '@nestjs/common';
import { DidoxService } from './didox.service';
import { DidoxController } from './didox.controller';
import { ProductsModule } from '../products/products.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [ProductsModule, TaskModule],
  controllers: [DidoxController],
  providers: [DidoxService],
})
export class DidoxModule {}
