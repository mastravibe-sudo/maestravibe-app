// components/auth/paymentMethods.ts
export const PAKISTANI_BANKS = [
  'HBL (Habib Bank Limited)',
  'UBL (United Bank Limited)',
  'MCB Bank',
  'Meezan Bank',
  'Allied Bank',
  'Bank Alfalah',
  'Askari Bank',
  'Faysal Bank',
  'National Bank of Pakistan',
  'Bank of Punjab',
  'Standard Chartered Pakistan',
  'Habib Metropolitan Bank',
  'Soneri Bank',
  'JS Bank',
  'Al Baraka Bank',
  'Dubai Islamic Bank Pakistan',
  'Silk Bank',
  'Summit Bank',
];

export type PaymentMethodConfig = {
  label: string;
  icon: string;
  needsBankName: boolean;
  accountLabel: string;
  accountPlaceholder: string;
  accountMaxLength?: number;
  accountInputMode?: 'numeric' | 'text';
  accountPattern?: RegExp;
  titleLabel: string;
  hint?: string;
  noAccountNeeded?: boolean;
};

export const PAYMENT_METHODS: Record<string, PaymentMethodConfig> = {
  'Bank Transfer': {
    label: 'Bank Transfer',
    icon: '🏦',
    needsBankName: true,
    accountLabel: 'Account Number / IBAN',
    accountPlaceholder: 'e.g. PK36HABB0000001234567890',
    accountMaxLength: 24,
    accountInputMode: 'text',
    accountPattern: /^[A-Za-z0-9]{8,24}$/,
    titleLabel: 'Account Title',
    hint: 'Enter your full IBAN if available, or your account number.',
  },
  JazzCash: {
    label: 'JazzCash',
    icon: '📱',
    needsBankName: false,
    accountLabel: 'JazzCash Mobile Number',
    accountPlaceholder: '03XXXXXXXXX',
    accountMaxLength: 11,
    accountInputMode: 'numeric',
    accountPattern: /^03\d{9}$/,
    titleLabel: 'Account Holder Name',
    hint: 'Must be the mobile number registered with your JazzCash wallet.',
  },
  EasyPaisa: {
    label: 'EasyPaisa',
    icon: '💚',
    needsBankName: false,
    accountLabel: 'EasyPaisa Mobile Number',
    accountPlaceholder: '03XXXXXXXXX',
    accountMaxLength: 11,
    accountInputMode: 'numeric',
    accountPattern: /^03\d{9}$/,
    titleLabel: 'Account Holder Name',
    hint: 'Must be the mobile number registered with your EasyPaisa wallet.',
  },
  SadaPay: {
    label: 'SadaPay',
    icon: '🌸',
    needsBankName: false,
    accountLabel: 'SadaPay Mobile Number',
    accountPlaceholder: '03XXXXXXXXX',
    accountMaxLength: 11,
    accountInputMode: 'numeric',
    accountPattern: /^03\d{9}$/,
    titleLabel: 'Account Holder Name',
    hint: 'Must be the mobile number linked to your SadaPay account.',
  },
  NayaPay: {
    label: 'NayaPay',
    icon: '🔷',
    needsBankName: false,
    accountLabel: 'NayaPay Mobile Number',
    accountPlaceholder: '03XXXXXXXXX',
    accountMaxLength: 11,
    accountInputMode: 'numeric',
    accountPattern: /^03\d{9}$/,
    titleLabel: 'Account Holder Name',
    hint: 'Must be the mobile number linked to your NayaPay account.',
  },
  Cash: {
    label: 'Cash',
    icon: '💵',
    needsBankName: false,
    accountLabel: '',
    accountPlaceholder: '',
    titleLabel: '',
    noAccountNeeded: true,
    hint: 'Commission will be settled in cash — no account details required.',
  },
};

export const PAYMENT_ORDER = ['Bank Transfer', 'JazzCash', 'EasyPaisa', 'SadaPay', 'NayaPay', 'Cash'];