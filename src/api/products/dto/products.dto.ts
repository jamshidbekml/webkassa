import { Expose, Transform } from 'class-transformer';

export class ProductsResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  barcode: string;

  @Expose()
  packagecode: string;

  @Expose()
  @Transform(({ obj }) => +obj.vat / 100)
  vatRate: number;

  @Expose()
  discountAmount: number;

  @Expose()
  amount: number;

  @Expose()
  catalogcode: number;

  @Expose()
  count: number;

  @Expose()
  isMarked: boolean;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;


  @Expose()
  labels: any[];
}
