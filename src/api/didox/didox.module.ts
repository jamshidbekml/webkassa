import { Module } from '@nestjs/common';
import { DidoxService } from './didox.service';
import { DidoxController } from './didox.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [DidoxController],
  providers: [DidoxService],
})
export class DidoxModule {}
