import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type AccountRole = 'owner' | 'manager' | 'driver';
export type AuthStatus = 'loading' | 'anon' | 'needs_setup' | 'needs_phone' | 'pending_approval' | 'ready';

export interface AccountSettings {
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  vat_rate: number;
  vat_default_included: boolean;
  driver_sees_freight: boolean;
  driver_requires_approval: boolean;
  join_enabled: boolean;
  join_requires_approval: boolean;
  join_role: 'driver' | 'manager';
  invite_valid_days: number;
  notify_driver_expense: boolean;
  weekly_summary: boolean;
  uetds_reminder: boolean;
  custom_categories: string[];
  contact_tags: string[];
  remind_before_days: number;
  title?: string;
  tax_office?: string;
  tax_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  iban?: string;
}

export const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
  currency: 'TRY',
  vat_rate: 20,
  vat_default_included: false,
  driver_sees_freight: false,
  driver_requires_approval: false,
  join_enabled: true,
  join_requires_approval: true,
  join_role: 'driver',
  invite_valid_days: 7,
  notify_driver_expense: true,
  weekly_summary: true,
  uetds_reminder: false,
  custom_categories: [],
  contact_tags: [],
  remind_before_days: 3,
};

const DEMO_STORAGE_KEY = 'lojitr-demo-active';
const ACTIVE_ACCOUNT_KEY = 'lojitr-active-account-v1';
const THEME_STORAGE_KEY = 'lojitr-theme';

const getInitialTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return 'light';
};

export interface AuthState {
  status: AuthStatus;
  mode: 'demo' | 'supabase';
  user: { id: string; email?: string; name?: string; phone?: string } | null;
  accountId: string | null;
  accountName: string | null;
  joinCode: string | null;
  role: AccountRole;
  driverId: string | null;
  assignedVehicleIds: string[];
  accountSettings: AccountSettings;
  accounts: Array<{ accountId: string; accountName: string; role: AccountRole; joinCode: string | null }>;
  pendingAccounts: Array<{ accountId: string; accountName: string }>;
  billing: any | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  initialize: () => Promise<void>;
  enterDemo: (role?: AccountRole) => void;
  setDemoRole: (role: AccountRole) => void;
  switchAccount: (accountId: string) => Promise<void>;
  refreshBilling: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  mode: 'demo',
  user: null,
  accountId: null,
  accountName: null,
  joinCode: null,
  role: 'owner',
  driverId: null,
  assignedVehicleIds: [],
  accountSettings: DEFAULT_ACCOUNT_SETTINGS,
  accounts: [],
  pendingAccounts: [],
  billing: null,
  theme: getInitialTheme(),

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  enterDemo: (role = 'owner') => {
    localStorage.setItem(DEMO_STORAGE_KEY, '1');
    set({
      status: 'ready',
      mode: 'demo',
      user: {
        id: 'demo-user',
        email: 'demo@lojitr.com',
        name: role === 'driver' ? 'Ahmet Yılmaz (Şoför)' : 'Mustafa Kaya (Yönetici)',
        phone: '+905321112233',
      },
      accountId: 'demo-account',
      accountName: 'Kaya Uluslararası Nakliyat',
      joinCode: 'KAYA-42',
      role,
      driverId: role === 'driver' ? 'drv-1' : null,
      assignedVehicleIds: role === 'driver' ? ['veh-1'] : [],
      accountSettings: DEFAULT_ACCOUNT_SETTINGS,
      accounts: [{ accountId: 'demo-account', accountName: 'Kaya Uluslararası Nakliyat', role, joinCode: 'KAYA-42' }],
      pendingAccounts: [],
      billing: {
        locked: false,
        in_trial: true,
        trial_days_left: 14,
        vehicle_limit: 10,
        billable_vehicles: 3,
        storage: {
          used_bytes: 45000000,
          quota_bytes: 500000000,
          percent: 9.0,
          package: 'standart',
          package_gb: 10,
        },
      },
    });
  },

  setDemoRole: (role) => {
    get().enterDemo(role);
  },

  initialize: async () => {
    // Apply theme immediately
    const initialTheme = getInitialTheme();
    set({ theme: initialTheme });
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Default to demo mode immediately if demo active or no session
    if (localStorage.getItem(DEMO_STORAGE_KEY) === '1' || window.location.search.includes('demo=1')) {
      get().enterDemo('owner');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // Automatically start demo for instant rich showcase
        get().enterDemo('owner');
        return;
      }

      const u = session.user;
      set({
        status: 'ready',
        mode: 'supabase',
        user: { id: u.id, email: u.email, name: u.user_metadata?.full_name || 'Kullanıcı' },
        accountId: 'acc-1',
        accountName: 'LojiTR Filom',
        role: 'owner',
      });
    } catch {
      get().enterDemo('owner');
    }
  },

  switchAccount: async (accountId: string) => {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
    await get().initialize();
  },

  refreshBilling: async () => {},

  signOut: async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    try {
      await supabase.auth.signOut();
    } catch {}
    get().enterDemo('owner');
  },
}));