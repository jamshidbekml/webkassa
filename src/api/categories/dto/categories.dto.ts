import { Expose, Transform } from 'class-transformer';

export class CategoriesResDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  @Transform(({ obj }) => obj._count?.products || 0, { toClassOnly: true })
  products: number;
}
