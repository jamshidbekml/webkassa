import axios from 'axios';

export async function getSatPayments(branchPrifix: string) {
  try {
    const { data } = await axios.get<{ data: { id: number; name: string } }[]>(
      `https://kassa.payment-munis.uz/api/v1/clients/payments?branch=${branchPrifix}`,
    );

    return data[0].data;
  } catch (err) {
    throw new Error(`ERROR ON GET SAT PAYMENTS: ${err.message}`);
  }
}
