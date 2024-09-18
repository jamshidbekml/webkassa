import { Expose, Transform } from 'class-transformer';

export class ProductsResDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.catalogcode)
  barcode: string;

  @Expose()
  packagecode: string;

  @Expose()
  @Transform(({ obj }) => +obj.vat)
  vatPercent: number;

  @Expose()
  discountAmount: number;

  @Expose()
  amount: number;

  @Expose()
  count: number;

  @Expose()
  isMarked: boolean;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  @Transform(({ obj }) => obj.labels)
  classCode: any[];
}
