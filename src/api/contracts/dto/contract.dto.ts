import { Expose, Transform } from 'class-transformer';

export class ContractResponse {
  @Expose()
  id: string;

  @Expose()
  clientFullName: string;

  @Expose()
  contractId: string;

  @Expose()
  phone: string;

  @Expose()
  passportSeries: string;

  @Expose()
  pinfl: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  //   @Expose()
  //   @Transform(
  //     ({ value }) => {
  //       return value
  //         ? {
  //             id: value.product.id,
  //             barcode: value.product.barcode,
  //             psid: value.product.catalogcode,
  //             name: value.product.name,
  //             packageCode: value.product.packagecode,
  //             vat: Number(value.product.vat) / 100,
  //             price: value.amount,
  //             amount: value.count,
  //             discountAmount: value.discountAmount,
  //             labels:
  //               value.labels.length > 0
  //                 ? value.labels.map((label) => label.label)
  //                 : [],
  //             units: 'шт',
  //             isDecimalUnits: false,
  //             unitCode: null,
  //             commissionPINFL: null,
  //             commissionTIN: null,
  //           }
  //         : null;
  //     },
  //     {
  //       toClassOnly: true,
  //     },
  //   )
  //   products: any[];
}
