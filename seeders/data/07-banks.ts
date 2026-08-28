export interface BankSeed {
  name: string;
  accountNumber: bigint;
}

export const banksData: BankSeed[] = [
  {
    name: "Commercial Bank of Ethiopia (CBE)",
    accountNumber: BigInt("1000123456789"),
  },
  {
    name: "Telebirr (Merchant Pay)",
    accountNumber: BigInt("911223344"),
  },
  {
    name: "Bank of Abyssinia (BOA)",
    accountNumber: BigInt("88219012"),
  },
  {
    name: "Awash Bank",
    accountNumber: BigInt("0142512345600"),
  },
  {
    name: "Dashen Bank",
    accountNumber: BigInt("51201948201"),
  },
];
