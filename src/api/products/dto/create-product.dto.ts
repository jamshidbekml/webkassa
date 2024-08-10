export class CreateProductDto {
  name: string;
  barcode: string;
  packagecode: string;
  vat: number;
  amount: number;
  discountAmount: number;
  count: number;
  branchId: string;
  categoryId: string;
}
