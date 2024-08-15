export class CreateContractDto {
  contractId: string;
  phone: string;
  passportSeries: string;
  pinfl: string;
  products: {
    productId: string;
    count: number;
    amount: number;
    discountAmount: number;
    labels?: string[];
  }[];
}
