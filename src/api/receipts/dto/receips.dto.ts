import { Expose, Transform } from 'class-transformer';

export class GetReceiptsDto {
  @Expose()
  @Transform(({ obj }) => obj.contract.saleId)
  saleId: number;

  @Expose()
  @Transform(({ obj }) => obj.contract.payments)
  payments: any[];

  @Expose()
  @Transform(({ obj }) => {
    return obj.contract.products.map((e) => ({
      id: e.product.id,
      name: e.product.name,
      barcode: e.product.barcode,
      units: 'шт',
      price: Math.ceil(e.amount * 100) / e.count,
      vat: +e.product.vat / 100,
      amount: e.count,
      isDecimalUnits: false,
      labels: e.labels.map((l) => l.label),
      psid: e.product.catalogcode,
      packageCode: e.product.packagecode,
      unitCode: null,
      commissionPINFL: null,
      commissionTIN: null,
    }));
  })
  products: number;
}
