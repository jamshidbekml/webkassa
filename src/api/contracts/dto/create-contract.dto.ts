export class CreateContractDto {
  contractId: string;
  phone: string;
  clientFullName: string;
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
