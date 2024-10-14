const oldContracts = [
  '311020705',
  '311019919',
  '311020150',
  '311020602',
  '311020705',
  '311020602',
];

export function checkIsOldContract(inn: string) {
  return oldContracts.includes(inn);
}
