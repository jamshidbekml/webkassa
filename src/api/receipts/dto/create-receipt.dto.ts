import { PAYMENT_TYPE, RECEIPT_TYPE } from '@prisma/client';

export class CreateReceiptDto {
  cTin: string;
  cName: string;
  tAmount: number;
  tVat: number;
  saleId: string;
  type: RECEIPT_TYPE;
  contractId: string;
  createdAt?: Date;
  payments: { amount: number; type: PAYMENT_TYPE }[];
}

export class CreatePaymentDto {
  amount: number;
  type: PAYMENT_TYPE;
}
