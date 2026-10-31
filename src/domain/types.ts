// Central TypeScript domain definitions for LojiTR

export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';
export type VehicleType = 'tir' | 'kamyon' | 'kamyonet' | 'dorse' | 'diger';
export type VehicleOwnership = 'oz' | 'kiralik' | 'dis';
export type AxleConfigCode = '4x2' | '4x2_single' | '6x2' | '6x4' | '8x2' | '8x4' | 'dorse_2' | 'dorse_3' | 'dorse_3_single';

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  ownership?: VehicleOwnership;
  carrierContactId?: string;
  brand?: string;
  year?: number;
  km?: number;
  driverId?: string;
  trailerId?: string;
  axleConfig?: AxleConfigCode;
  hasSpare?: boolean;
  avgFuelPer100Km?: number;
  active: boolean;
  note?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  iban?: string;
  salary?: number;
  perDiem?: number;
  kmRate?: number;
  kmMode?: 'trip' | 'odometer';
  tripCommissionPct?: number;
  licenseExpiry?: string;
  srcExpiry?: string;
  psychotechExpiry?: string;
  defaultVehicleId?: string;
  personId?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  note?: string;
}

export type ContactKind = 'musteri' | 'komisyoncu' | 'taseron' | 'tedarikci' | 'diger';

export interface Contact {
  id: string;
  name: string;
  kind: ContactKind;
  contactPerson?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  taxOffice?: string;
  taxNo?: string;
  iban?: string;
  dueDays?: number;
  creditLimit?: number;
  tags?: string[];
  active?: boolean;
  note?: string;
}

export type MoneyAccountKind = 'kasa' | 'banka' | 'kredi_karti' | 'yakit_karti';

export interface MoneyAccount {
  id: string;
  kind: MoneyAccountKind;
  name: string;
  bankName?: string;
  iban?: string;
  openingBalance: number;
  creditLimit?: number;
  statementDay?: number;
  dueDay?: number;
  active: boolean;
  note?: string;
}

export type TripPricingKind = 'sabit' | 'ton' | 'km';
export type TripInvoiceStatus = 'kesilmedi' | 'kesildi' | 'iade';
export type TripStatus = 'planlandi' | 'yolda' | 'tamamlandi' | 'iptal';
export type VatWithholdingCode = '2/10' | '5/10' | '7/10' | '9/10';

export interface Trip {
  id: string;
  date: string;
  endDate?: string;
  vehicleId: string;
  trailerId?: string;
  driverId?: string;
  contactId?: string;
  brokerId?: string;
  brokerAmount?: number;
  carrierId?: string;
  carrierAmount?: number;
  origin: string;
  destination: string;
  cargo?: string;
  weightTon?: number;
  km?: number;
  startKm?: number;
  endKm?: number;
  pricingKind?: TripPricingKind;
  unitPrice?: number;
  waybillNo?: string;
  invoiceStatus?: TripInvoiceStatus;
  invoiceNo?: string;
  freight: number;
  vatIncluded: boolean;
  vatRate: number;
  vatWithholding?: VatWithholdingCode;
  commission: number;
  dueDate?: string;
  status: TripStatus;
  note?: string;
  currency?: CurrencyCode;
  originalFreight?: number;
  fxRate?: number;
  expensesTotal: number;
  collected: number;
  collectedFx?: number;
  deliveredAt?: string;
  receiverName?: string;
  signatureSvg?: string;
  deliveryNote?: string;
  deliveryCoord?: string;
  uetdsReported?: boolean;
  uetdsRefNo?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

export type ExpenseCategory =
  | 'yakit' | 'adblue' | 'otoyol' | 'yemek' | 'harcirah'
  | 'bakim' | 'lastik' | 'parca' | 'sigorta' | 'kasko'
  | 'muayene' | 'vergi' | 'ceza' | 'yikama' | 'otel'
  | 'park' | 'vize' | 'komisyon' | 'banka_masrafi' | 'diger';

export type ExpenseSource = 'kasa' | 'banka' | 'kredi_karti' | 'yakit_karti' | 'sofor' | 'veresiye';

export interface Expense {
  id: string;
  date: string;
  vehicleId?: string;
  tripId?: string;
  driverId?: string;
  contactId?: string;
  category: ExpenseCategory;
  customLabel?: string;
  amount: number;
  vatRate?: number;
  litres?: number;
  km?: number;
  source: ExpenseSource;
  moneyAccountId?: string;
  receiptUrl?: string;
  note?: string;
  currency?: CurrencyCode;
  originalAmount?: number;
  fxRate?: number;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

export type PaymentKind = 'tahsilat' | 'odeme' | 'aktarim' | 'maas' | 'harcirah' | 'avans';
export type PaymentMethod = 'nakit' | 'havale' | 'kredi_karti' | 'cek' | 'senet' | 'mahsup' | 'diger';

export interface Payment {
  id: string;
  date: string;
  kind: PaymentKind;
  amount: number;
  method: PaymentMethod;
  moneyAccountId?: string;
  toAccountId?: string;
  contactId?: string;
  tripId?: string;
  invoiceId?: string;
  driverId?: string;
  checkId?: string;
  referenceNo?: string;
  note?: string;
  currency?: CurrencyCode;
  originalAmount?: number;
  fxRate?: number;
}

export type CheckDirection = 'alinan' | 'verilen';
export type CheckKind = 'cek' | 'senet';
export type CheckStatus =
  | 'portfoy' | 'bankada' | 'tahsil' | 'ciro' | 'karsiliksiz'
  | 'bekliyor' | 'odendi' | 'iade' | 'iptal';

export interface BankCheck {
  id: string;
  direction: CheckDirection;
  kind: CheckKind;
  serialNo?: string;
  bankName?: string;
  drawer?: string;
  contactId?: string;
  endorsedToContactId?: string;
  endorsedTo?: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  clearedDate?: string;
  moneyAccountId?: string;
  status: CheckStatus;
  note?: string;
  currency?: CurrencyCode;
  originalAmount?: number;
  fxRate?: number;
}

export interface LedgerAdjustment {
  id: string;
  contactId: string;
  transferId?: string;
  ledger: 'receivable' | 'payable';
  direction: 'borc' | 'alacak';
  amount: number;
  reason?: string;
  date: string;
  currency?: CurrencyCode;
  originalAmount?: number;
  fxRate?: number;
}

export type ReminderKind =
  | 'muayene' | 'sigorta' | 'kasko' | 'k1' | 'taksit'
  | 'yag' | 'lastik' | 'src' | 'diger' | 'odeme';

export interface Reminder {
  id: string;
  vehicleId?: string;
  contactId?: string;
  kind: ReminderKind;
  title?: string;
  amount?: number;
  dueDate?: string;
  dueKm?: number;
  repeatMonths?: number;
  repeatKm?: number;
  note?: string;
  doneAt?: string;
}

export interface Loan {
  id: string;
  kind: 'tasit' | 'kredi' | 'leasing' | 'diger';
  title: string;
  lender?: string;
  vehicleId?: string;
  moneyAccountId?: string;
  principal: number;
  interestRate?: number;
  installmentCount: number;
  startDate: string;
  note?: string;
}

export interface LoanInstallment {
  id: string;
  loanId: string;
  no: number;
  dueDate: string;
  principal: number;
  interest: number;
  amount: number;
  paidOn?: string;
  paidAccountId?: string;
}

export interface Invoice {
  id: string;
  direction: 'giden' | 'gelen';
  invoiceNo: string;
  contactId: string;
  issueDate: string;
  dueDate?: string;
  status: 'taslak' | 'kesildi' | 'iptal';
  lines: InvoiceLine[];
  subtotal: number;
  vatTotal: number;
  withholdingTotal: number;
  total: number;
  paid: number;
  note?: string;
}

export interface InvoiceLine {
  id?: string;
  invoiceId?: string;
  tripId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  withholding?: VatWithholdingCode;
  net: number;
  vat: number;
  total: number;
}
