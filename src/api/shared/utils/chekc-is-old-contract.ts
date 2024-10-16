const oldContracts = ['302476158', '306912704', '303280251', '305756147'];

export function checkIsOldContract(inn: string) {
  return oldContracts.includes(inn);
}
