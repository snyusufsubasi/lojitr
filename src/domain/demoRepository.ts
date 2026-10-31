// In-Memory & LocalStorage Demo Database for Kaya Nakliyat
import type {
  Vehicle, Driver, Contact, MoneyAccount, Trip, Expense,
  Payment, BankCheck, LedgerAdjustment, Reminder, Loan, LoanInstallment, Invoice
} from './types';
import { isoToday, addDaysIso } from '@/lib/formatters';

const DEMO_DB_KEY = 'lojitr-demo-db-v1';

export interface DemoDbState {
  vehicles: Vehicle[];
  drivers: Driver[];
  contacts: Contact[];
  moneyAccounts: MoneyAccount[];
  trips: Trip[];
  expenses: Expense[];
  payments: Payment[];
  checks: BankCheck[];
  adjustments: LedgerAdjustment[];
  reminders: Reminder[];
  loans: Loan[];
  installments: LoanInstallment[];
  invoices: Invoice[];
}

function getInitialDb(): DemoDbState {
  const today = isoToday();

  const vehicles: Vehicle[] = [
    {
      id: 'veh-1',
      plate: '34 KYA 101',
      type: 'tir',
      ownership: 'oz',
      brand: 'Mercedes-Benz Actros 1848 LS',
      year: 2023,
      km: 284500,
      driverId: 'drv-1',
      trailerId: 'veh-4',
      axleConfig: '4x2',
      hasSpare: true,
      avgFuelPer100Km: 29.5,
      active: true,
      note: 'Ana hat çekici · Euro 6',
    },
    {
      id: 'veh-2',
      plate: '06 KYA 242',
      type: 'tir',
      ownership: 'oz',
      brand: 'Ford Trucks F-Max 500',
      year: 2022,
      km: 362100,
      driverId: 'drv-2',
      axleConfig: '4x2',
      hasSpare: true,
      avgFuelPer100Km: 31.0,
      active: true,
    },
    {
      id: 'veh-3',
      plate: '41 KYA 308',
      type: 'kamyon',
      ownership: 'oz',
      brand: 'Mercedes-Benz Atego 1518',
      year: 2021,
      km: 198400,
      driverId: 'drv-3',
      axleConfig: '6x2',
      hasSpare: false,
      avgFuelPer100Km: 22.0,
      active: true,
    },
    {
      id: 'veh-4',
      plate: '34 KYA 901',
      type: 'dorse',
      ownership: 'oz',
      brand: 'Krone Mega Liner Tenteli',
      year: 2023,
      axleConfig: 'dorse_3',
      hasSpare: true,
      active: true,
    },
  ];

  const drivers: Driver[] = [
    {
      id: 'drv-1',
      name: 'Ahmet Yılmaz',
      phone: '+90 532 411 22 33',
      iban: 'TR320006200011100006655443',
      salary: 42000,
      perDiem: 1500,
      kmRate: 2.0,
      kmMode: 'trip',
      tripCommissionPct: 0,
      licenseExpiry: addDaysIso(today, 180),
      srcExpiry: addDaysIso(today, 25),
      psychotechExpiry: addDaysIso(today, 240),
      defaultVehicleId: 'veh-1',
      startDate: '2024-01-01',
      active: true,
    },
    {
      id: 'drv-2',
      name: 'Mehmet Demir',
      phone: '+90 533 522 33 44',
      iban: 'TR450006400000112233445566',
      salary: 42000,
      perDiem: 1500,
      kmRate: 0,
      kmMode: 'trip',
      tripCommissionPct: 3,
      licenseExpiry: addDaysIso(today, 400),
      srcExpiry: addDaysIso(today, 320),
      psychotechExpiry: addDaysIso(today, 15),
      defaultVehicleId: 'veh-2',
      startDate: '2024-03-01',
      active: true,
    },
    {
      id: 'drv-3',
      name: 'Hasan Şahin',
      phone: '+90 542 633 44 55',
      salary: 38000,
      perDiem: 1000,
      kmRate: 1.75,
      kmMode: 'odometer',
      tripCommissionPct: 0,
      defaultVehicleId: 'veh-3',
      startDate: '2024-06-01',
      active: true,
    },
  ];

  const contacts: Contact[] = [
    {
      id: 'cnt-1',
      name: 'Anadolu Cam Sanayi A.Ş.',
      kind: 'musteri',
      contactPerson: 'Selim Bey',
      phone: '+90 262 644 10 20',
      email: 'lojistik@anadolucam.example.com',
      city: 'Kocaeli',
      taxOffice: 'İlyasbey',
      taxNo: '0680123456',
      dueDays: 30,
      creditLimit: 500000,
      tags: ['Fabrika', 'Cam'],
      active: true,
    },
    {
      id: 'cnt-2',
      name: 'Ege Demir Çelik A.Ş.',
      kind: 'musteri',
      contactPerson: 'Burcu Hanım',
      phone: '+90 232 616 20 30',
      email: 'sevkiyat@egedemir.example.com',
      city: 'İzmir',
      taxOffice: 'Aliağa',
      taxNo: '3250987654',
      dueDays: 45,
      creditLimit: 750000,
      tags: ['Demir-Çelik'],
      active: true,
    },
    {
      id: 'cnt-3',
      name: 'Toros Tarım Lojistik',
      kind: 'musteri',
      contactPerson: 'Kemal Arslan',
      phone: '+90 324 238 40 50',
      city: 'Mersin',
      dueDays: 15,
      active: true,
    },
    {
      id: 'cnt-4',
      name: 'Yıldız Nakliyat Komisyonculuğu',
      kind: 'komisyoncu',
      contactPerson: 'Cemal Yıldız',
      phone: '+90 532 700 80 90',
      city: 'İstanbul',
      active: true,
    },
    {
      id: 'cnt-5',
      name: 'Özkan Lojistik (Taşeron)',
      kind: 'taseron',
      contactPerson: 'Serkan Özkan',
      phone: '+90 535 811 92 03',
      city: 'Ankara',
      active: true,
    },
    {
      id: 'cnt-6',
      name: 'Opet Otobil Kurumsal',
      kind: 'tedarikci',
      city: 'İstanbul',
      active: true,
    },
  ];

  const moneyAccounts: MoneyAccount[] = [
    { id: 'acc-kasa', kind: 'kasa', name: 'Merkez Kasa', openingBalance: 45000, active: true },
    {
      id: 'acc-banka',
      kind: 'banka',
      name: 'Garanti BBVA Ticari',
      bankName: 'Garanti BBVA',
      iban: 'TR120006200045600001234567',
      openingBalance: 285000,
      active: true,
    },
    {
      id: 'acc-yakit',
      kind: 'yakit_karti',
      name: 'Opet Otobil Taşıt Tanıma',
      openingBalance: 0,
      creditLimit: 200000,
      active: true,
    },
  ];

  const trips: Trip[] = [
    {
      id: 'trp-1',
      date: addDaysIso(today, -6),
      endDate: addDaysIso(today, -5),
      vehicleId: 'veh-1',
      trailerId: 'veh-4',
      driverId: 'drv-1',
      contactId: 'cnt-1',
      origin: 'Gebze',
      destination: 'İskenderun',
      cargo: 'Endüstriyel Cam Paleti',
      weightTon: 24.8,
      km: 980,
      startKm: 283520,
      endKm: 284500,
      pricingKind: 'sabit',
      waybillNo: 'IRS-2026-0841',
      invoiceStatus: 'kesildi',
      invoiceNo: 'SFR2026000014',
      freight: 58000,
      vatIncluded: false,
      vatRate: 20,
      vatWithholding: '2/10',
      commission: 0,
      dueDate: addDaysIso(today, 24),
      status: 'tamamlandi',
      expensesTotal: 19400,
      collected: 30000,
      uetdsReported: true,
      uetdsRefNo: 'UETDS-998124',
      receiverName: 'Ahmet Demir (Fabrika Teslim)',
      deliveredAt: addDaysIso(today, -5),
    },
    {
      id: 'trp-2',
      date: addDaysIso(today, -3),
      vehicleId: 'veh-2',
      driverId: 'drv-2',
      contactId: 'cnt-2',
      brokerId: 'cnt-4',
      brokerAmount: 3000,
      origin: 'Aliağa',
      destination: 'Ankara',
      cargo: 'Nervürlü İnşaat Demiri',
      weightTon: 26.2,
      km: 610,
      pricingKind: 'ton',
      unitPrice: 1800,
      waybillNo: 'IRS-2026-0899',
      invoiceStatus: 'kesilmedi',
      freight: 47160,
      vatIncluded: false,
      vatRate: 20,
      vatWithholding: '2/10',
      commission: 0,
      dueDate: addDaysIso(today, 42),
      status: 'tamamlandi',
      expensesTotal: 13250,
      collected: 0,
      uetdsReported: false,
    },
    {
      id: 'trp-3',
      date: today,
      vehicleId: 'veh-3',
      driverId: 'drv-3',
      contactId: 'cnt-3',
      origin: 'Mersin',
      destination: 'Konya',
      cargo: 'Gübre Çuvalı',
      weightTon: 14.5,
      km: 355,
      pricingKind: 'sabit',
      freight: 29500,
      vatIncluded: false,
      vatRate: 20,
      commission: 0,
      dueDate: addDaysIso(today, 15),
      status: 'yolda',
      expensesTotal: 7800,
      collected: 0,
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'exp-1',
      date: addDaysIso(today, -6),
      vehicleId: 'veh-1',
      tripId: 'trp-1',
      driverId: 'drv-1',
      contactId: 'cnt-6',
      category: 'yakit',
      amount: 16200,
      vatRate: 20,
      litres: 385,
      km: 283800,
      source: 'yakit_karti',
      moneyAccountId: 'acc-yakit',
      note: 'Opet Pozantı Tesisleri Motorin',
    },
    {
      id: 'exp-2',
      date: addDaysIso(today, -5),
      vehicleId: 'veh-1',
      tripId: 'trp-1',
      driverId: 'drv-1',
      category: 'otoyol',
      amount: 3200,
      vatRate: 20,
      source: 'banka',
      moneyAccountId: 'acc-banka',
      note: 'Niğde - Ankara Otoyolu HGS',
    },
    {
      id: 'exp-3',
      date: addDaysIso(today, -3),
      vehicleId: 'veh-2',
      tripId: 'trp-2',
      driverId: 'drv-2',
      category: 'yakit',
      amount: 13250,
      vatRate: 20,
      litres: 315,
      source: 'yakit_karti',
      moneyAccountId: 'acc-yakit',
      note: 'Shell Afyon Motorin',
    },
    {
      id: 'exp-4',
      date: today,
      vehicleId: 'veh-3',
      tripId: 'trp-3',
      driverId: 'drv-3',
      category: 'yakit',
      amount: 7800,
      vatRate: 20,
      litres: 185,
      source: 'sofor',
      note: 'Şoför cebinden nakit mazot aldı',
    },
  ];

  const payments: Payment[] = [
    {
      id: 'pay-1',
      date: addDaysIso(today, -2),
      kind: 'tahsilat',
      amount: 30000,
      method: 'havale',
      moneyAccountId: 'acc-banka',
      contactId: 'cnt-1',
      tripId: 'trp-1',
      note: 'Gebze-İskenderun seferi kısmi havale',
    },
    {
      id: 'pay-2',
      date: addDaysIso(today, -4),
      kind: 'avans',
      amount: 10000,
      method: 'nakit',
      moneyAccountId: 'acc-kasa',
      driverId: 'drv-1',
      note: 'Ahmet Yılmaz yol avansı',
    },
  ];

  const checks: BankCheck[] = [
    {
      id: 'chk-1',
      direction: 'alinan',
      kind: 'cek',
      serialNo: 'ÇK-884120',
      bankName: 'İş Bankası',
      drawer: 'Anadolu Cam Sanayi A.Ş.',
      contactId: 'cnt-1',
      amount: 37280,
      issueDate: addDaysIso(today, -1),
      dueDate: addDaysIso(today, 21),
      status: 'portfoy',
      note: 'Gebze-İskenderun kalan bakiye çeki',
    },
    {
      id: 'chk-2',
      direction: 'verilen',
      kind: 'cek',
      serialNo: 'VR-10928',
      bankName: 'Garanti BBVA',
      amount: 55000,
      issueDate: addDaysIso(today, -10),
      dueDate: addDaysIso(today, 35),
      status: 'bekliyor',
      note: 'Lastik alımı vadeli çeki',
    },
  ];

  const reminders: Reminder[] = [
    {
      id: 'rem-1',
      vehicleId: 'veh-1',
      kind: 'muayene',
      title: '34 KYA 101 TÜVTÜRK Muayene',
      dueDate: addDaysIso(today, 12),
      repeatMonths: 12,
    },
    {
      id: 'rem-2',
      vehicleId: 'veh-2',
      kind: 'sigorta',
      title: '06 KYA 242 Trafik Sigortası Yenileme',
      amount: 28500,
      dueDate: addDaysIso(today, 5),
      repeatMonths: 12,
    },
  ];

  const loans: Loan[] = [
    {
      id: 'loan-1',
      kind: 'tasit',
      title: '34 KYA 101 Taşıt Kredisi',
      lender: 'Garanti BBVA',
      vehicleId: 'veh-1',
      moneyAccountId: 'acc-banka',
      principal: 1200000,
      interestRate: 3.2,
      installmentCount: 24,
      startDate: addDaysIso(today, -90),
      note: 'Çekici satın alım kredisi',
    },
  ];

  const installments: LoanInstallment[] = [
    {
      id: 'inst-1',
      loanId: 'loan-1',
      no: 1,
      dueDate: addDaysIso(today, -60),
      principal: 50000,
      interest: 22000,
      amount: 72000,
      paidOn: addDaysIso(today, -58),
      paidAccountId: 'acc-banka',
    },
    {
      id: 'inst-2',
      loanId: 'loan-1',
      no: 2,
      dueDate: addDaysIso(today, -30),
      principal: 51600,
      interest: 20400,
      amount: 72000,
      paidOn: addDaysIso(today, -29),
      paidAccountId: 'acc-banka',
    },
    {
      id: 'inst-3',
      loanId: 'loan-1',
      no: 3,
      dueDate: addDaysIso(today, 10),
      principal: 53250,
      interest: 18750,
      amount: 72000,
    },
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv-1',
      direction: 'giden',
      invoiceNo: 'SFR2026000014',
      contactId: 'cnt-1',
      issueDate: addDaysIso(today, -5),
      dueDate: addDaysIso(today, 25),
      status: 'kesildi',
      lines: [
        {
          id: 'inl-1',
          description: 'Gebze - İskenderun Cam Paleti Nakliyesi',
          quantity: 1,
          unit: 'Sefer',
          unitPrice: 58000,
          vatRate: 20,
          withholding: '2/10',
          net: 58000,
          vat: 11600,
          total: 67280,
        },
      ],
      subtotal: 58000,
      vatTotal: 11600,
      withholdingTotal: 2320,
      total: 67280,
      paid: 30000,
    },
  ];

  return {
    vehicles,
    drivers,
    contacts,
    moneyAccounts,
    trips,
    expenses,
    payments,
    checks,
    adjustments: [],
    reminders,
    loans,
    installments,
    invoices,
  };
}

class DemoRepository {
  private state: DemoDbState;

  constructor() {
    this.state = this.load();
  }

  private load(): DemoDbState {
    try {
      const raw = localStorage.getItem(DEMO_DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const initial = getInitialDb();
    this.save(initial);
    return initial;
  }

  private save(s: DemoDbState) {
    this.state = s;
    try {
      localStorage.setItem(DEMO_DB_KEY, JSON.stringify(s));
    } catch {}
  }

  // Vehicles
  async listVehicles() { return [...this.state.vehicles]; }
  async createVehicle(v: Omit<Vehicle, 'id'>) {
    const item: Vehicle = { ...v, id: `veh-${Date.now()}` };
    this.save({ ...this.state, vehicles: [item, ...this.state.vehicles] });
    return item;
  }
  async updateVehicle(id: string, patch: Partial<Vehicle>) {
    const updated = this.state.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v));
    this.save({ ...this.state, vehicles: updated });
    return updated.find((v) => v.id === id)!;
  }
  async deleteVehicle(id: string) {
    this.save({ ...this.state, vehicles: this.state.vehicles.filter((v) => v.id !== id) });
  }

  // Drivers
  async listDrivers() { return [...this.state.drivers]; }
  async createDriver(d: Omit<Driver, 'id'>) {
    const item: Driver = { ...d, id: `drv-${Date.now()}` };
    this.save({ ...this.state, drivers: [item, ...this.state.drivers] });
    return item;
  }
  async updateDriver(id: string, patch: Partial<Driver>) {
    const updated = this.state.drivers.map((d) => (d.id === id ? { ...d, ...patch } : d));
    this.save({ ...this.state, drivers: updated });
    return updated.find((d) => d.id === id)!;
  }
  async deleteDriver(id: string) {
    this.save({ ...this.state, drivers: this.state.drivers.filter((d) => d.id !== id) });
  }

  // Contacts
  async listContacts() { return [...this.state.contacts]; }
  async createContact(c: Omit<Contact, 'id'>) {
    const item: Contact = { ...c, id: `cnt-${Date.now()}` };
    this.save({ ...this.state, contacts: [item, ...this.state.contacts] });
    return item;
  }
  async updateContact(id: string, patch: Partial<Contact>) {
    const updated = this.state.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c));
    this.save({ ...this.state, contacts: updated });
    return updated.find((c) => c.id === id)!;
  }

  // Trips
  async listTrips() { return [...this.state.trips]; }
  async createTrip(t: Omit<Trip, 'id' | 'expensesTotal' | 'collected'>) {
    const item: Trip = { ...t, id: `trp-${Date.now()}`, expensesTotal: 0, collected: 0 };
    let updatedVehicles = this.state.vehicles;
    if (t.vehicleId && t.endKm) {
      updatedVehicles = this.state.vehicles.map((v) =>
        v.id === t.vehicleId && (!v.km || t.endKm! > v.km) ? { ...v, km: t.endKm } : v
      );
    }
    this.save({ ...this.state, vehicles: updatedVehicles, trips: [item, ...this.state.trips] });
    return item;
  }
  async updateTrip(id: string, patch: Partial<Trip>) {
    const updated = this.state.trips.map((t) => (t.id === id ? { ...t, ...patch } : t));
    this.save({ ...this.state, trips: updated });
    return updated.find((t) => t.id === id)!;
  }
  async markTripDelivered(id: string, payload: any) {
    await this.updateTrip(id, {
      status: 'tamamlandi',
      deliveredAt: payload.deliveredAt || new Date().toISOString(),
      receiverName: payload.receiverName,
      signatureSvg: payload.signatureSvg,
      deliveryNote: payload.deliveryNote,
      deliveryCoord: payload.deliveryCoord,
    });
  }

  // Expenses
  async listExpenses() { return [...this.state.expenses]; }
  async createExpense(e: Omit<Expense, 'id'>) {
    const item: Expense = { ...e, id: `exp-${Date.now()}` };
    let updatedVehicles = this.state.vehicles;
    if (e.vehicleId && e.km) {
      updatedVehicles = this.state.vehicles.map((v) =>
        v.id === e.vehicleId && (!v.km || e.km! > v.km) ? { ...v, km: e.km } : v
      );
    }
    this.save({ ...this.state, vehicles: updatedVehicles, expenses: [item, ...this.state.expenses] });
    return item;
  }

  // Money Accounts
  async listMoneyAccounts() { return [...this.state.moneyAccounts]; }

  // Payments
  async listPayments() { return [...this.state.payments]; }
  async createPayment(p: Omit<Payment, 'id'>) {
    const item: Payment = { ...p, id: `pay-${Date.now()}` };
    this.save({ ...this.state, payments: [item, ...this.state.payments] });
    return item;
  }

  // Checks
  async listChecks() { return [...this.state.checks]; }
  async createCheck(c: Omit<BankCheck, 'id'>) {
    const item: BankCheck = { ...c, id: `chk-${Date.now()}` };
    this.save({ ...this.state, checks: [item, ...this.state.checks] });
    return item;
  }
  async updateCheckStatus(id: string, status: BankCheck['status'], moneyAccountId?: string) {
    const updated = this.state.checks.map((c) =>
      c.id === id ? { ...c, status, moneyAccountId: moneyAccountId || c.moneyAccountId } : c
    );
    this.save({ ...this.state, checks: updated });
  }

  // Loans & Installments
  async listLoans() { return [...this.state.loans]; }
  async listInstallments() { return [...this.state.installments]; }
  async payInstallment(id: string, accountId: string) {
    const updated = this.state.installments.map((i) =>
      i.id === id ? { ...i, paidOn: isoToday(), paidAccountId: accountId } : i
    );
    this.save({ ...this.state, installments: updated });
  }

  // Invoices
  async listInvoices() { return [...this.state.invoices]; }
  async createInvoice(inv: Omit<Invoice, 'id'>) {
    const item: Invoice = { ...inv, id: `inv-${Date.now()}` };
    this.save({ ...this.state, invoices: [item, ...this.state.invoices] });
    return item;
  }
  async createBatchInvoice(payload: {
    contactId: string;
    tripIds: string[];
    invoiceNo: string;
    issueDate: string;
    dueDate?: string;
  }) {
    const matchedTrips = this.state.trips.filter((t) => payload.tripIds.includes(t.id));
    const lines = matchedTrips.map((t) => ({
      id: `line-${t.id}`,
      tripId: t.id,
      description: `${t.origin} - ${t.destination} Taşıma Navlunu (${t.cargo || 'Yük'})`,
      quantity: 1,
      unit: 'Sefer',
      unitPrice: t.freight,
      vatRate: t.vatRate || 20,
      withholding: t.vatWithholding,
      net: t.freight,
      vat: (t.freight * (t.vatRate || 20)) / 100,
      total: t.freight + (t.freight * (t.vatRate || 20)) / 100,
    }));

    const subtotal = lines.reduce((s, l) => s + l.net, 0);
    const vatTotal = lines.reduce((s, l) => s + l.vat, 0);
    const withholdingTotal = lines.reduce((s, l) => {
      if (l.withholding === '2/10') return s + (l.vat * 2) / 10;
      return s;
    }, 0);
    const total = subtotal + vatTotal - withholdingTotal;

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      direction: 'giden',
      invoiceNo: payload.invoiceNo,
      contactId: payload.contactId,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      status: 'kesildi',
      lines,
      subtotal,
      vatTotal,
      withholdingTotal,
      total,
      paid: 0,
      note: `${matchedTrips.length} adet sefer tek faturada birleştirildi.`,
    };

    // Mark trips as invoiced
    const updatedTrips = this.state.trips.map((t) =>
      payload.tripIds.includes(t.id) ? { ...t, invoiceStatus: 'kesildi' as const, invoiceNo: payload.invoiceNo } : t
    );

    this.save({
      ...this.state,
      invoices: [invoice, ...this.state.invoices],
      trips: updatedTrips,
    });
    return invoice;
  }

  // Account Transfer / Virman
  async createTransfer(payload: { fromAccountId: string; toAccountId: string; amount: number; note?: string }) {
    const p1: Payment = {
      id: `pay-out-${Date.now()}`,
      date: isoToday(),
      kind: 'aktarim',
      amount: payload.amount,
      method: 'havale',
      moneyAccountId: payload.fromAccountId,
      toAccountId: payload.toAccountId,
      note: `Virman Çıkış: ${payload.note || 'Hesaplar Arası Transfer'}`,
    };
    const p2: Payment = {
      id: `pay-in-${Date.now()}`,
      date: isoToday(),
      kind: 'tahsilat',
      amount: payload.amount,
      method: 'havale',
      moneyAccountId: payload.toAccountId,
      note: `Virman Giriş: ${payload.note || 'Hesaplar Arası Transfer'}`,
    };
    this.save({ ...this.state, payments: [p1, p2, ...this.state.payments] });
  }

  // Approvals
  async listApprovals() {
    const list = [
      {
        id: 'app-1',
        kind: 'expense' as const,
        title: 'Pozantı Opet Akaryakıt Fişi',
        requesterName: 'Ahmet Yılmaz (Şoför)',
        vehiclePlate: '34 KYA 101',
        amount: 16200,
        date: isoToday(),
        status: 'pending' as const,
        details: '385 LT Motorin · 42.08 ₺/LT · Sayaç: 284.500 KM',
        referenceId: 'exp-1',
      },
      {
        id: 'app-2',
        kind: 'advance' as const,
        title: 'Sefer Yol Harcırah Avansı Talebi',
        requesterName: 'Mehmet Demir (Şoför)',
        vehiclePlate: '06 KYA 242',
        amount: 3500,
        date: isoToday(),
        status: 'pending' as const,
        details: 'Ankara - Mersin seferi için kumanya ve otoyol avansı',
        referenceId: 'drv-2',
      },
      {
        id: 'app-3',
        kind: 'trip' as const,
        title: 'Dijital İmzalı İrsaliye & Teslimat Onayı',
        requesterName: 'Ali Öztürk (Şoför)',
        vehiclePlate: '41 KYA 308',
        amount: 38400,
        date: isoToday(),
        status: 'pending' as const,
        details: 'Gebze → Bursa rulo sac teslimatı · e-İmza alındı',
        referenceId: 'trp-1',
      },
    ];
    return list;
  }

  async approveItem(id: string) {
    return true;
  }

  async rejectItem(id: string) {
    return true;
  }

  // Reminders
  async listReminders() { return [...this.state.reminders]; }

  // Reset Demo DB
  reset() {
    const fresh = getInitialDb();
    this.save(fresh);
    return fresh;
  }
}

export const demoRepository = new DemoRepository();
