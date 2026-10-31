import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/domain/store/authStore';

// Feature Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { TripsListPage } from '@/pages/trips/TripsListPage';
import { TripFormPage } from '@/pages/trips/TripFormPage';
import { TripDetailPage } from '@/pages/trips/TripDetailPage';
import { ExpensesListPage } from '@/pages/expenses/ExpensesListPage';
import { ExpenseFormPage } from '@/pages/expenses/ExpenseFormPage';
import { MoneyOverviewPage } from '@/pages/money/MoneyOverviewPage';
import { CashCountPage } from '@/pages/money/CashCountPage';
import { ChecksPage } from '@/pages/money/ChecksPage';
import { AgendaPage } from '@/pages/money/AgendaPage';
import { ContactsListPage } from '@/pages/contacts/ContactsListPage';
import { ContactDetailPage } from '@/pages/contacts/ContactDetailPage';
import { InvoicesListPage } from '@/pages/invoices/InvoicesListPage';
import { VehiclesListPage } from '@/pages/vehicles/VehiclesListPage';
import { VehicleTiresPage } from '@/pages/vehicles/VehicleTiresPage';
import { DriversListPage } from '@/pages/drivers/DriversListPage';
import { DriverDetailPage } from '@/pages/drivers/DriverDetailPage';
import { DocumentsPage } from '@/pages/documents/DocumentsPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { ImportHubPage } from '@/pages/import/ImportHubPage';
import { LicensePage } from '@/pages/license/LicensePage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { VerifyDocumentPage } from '@/pages/public/VerifyDocumentPage';
import { LoginPage } from '@/pages/auth/LoginPage';

export const App: React.FC = () => {
  const { initialize, theme } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/giris" element={<LoginPage />} />
        <Route path="/dogrula/:token" element={<VerifyDocumentPage />} />

        {/* Authenticated / Demo Layout Shell */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          
          {/* Trips */}
          <Route path="seferler" element={<TripsListPage />} />
          <Route path="seferler/yeni" element={<TripFormPage />} />
          <Route path="seferler/:id" element={<TripDetailPage />} />
          
          {/* Expenses */}
          <Route path="masraflar" element={<ExpensesListPage />} />
          <Route path="masraflar/yeni" element={<ExpenseFormPage />} />
          
          {/* Money & Banking */}
          <Route path="para" element={<MoneyOverviewPage />} />
          <Route path="para/sayim" element={<CashCountPage />} />
          <Route path="para/cek-senet" element={<ChecksPage />} />
          <Route path="para/ajanda" element={<AgendaPage />} />
          
          {/* Contacts */}
          <Route path="musteriler" element={<ContactsListPage />} />
          <Route path="musteriler/:id" element={<ContactDetailPage />} />
          
          {/* Invoices */}
          <Route path="faturalar" element={<InvoicesListPage />} />
          
          {/* Vehicles & Fleet */}
          <Route path="araclar" element={<VehiclesListPage />} />
          <Route path="araclar/:id/lastik" element={<VehicleTiresPage />} />
          
          {/* Drivers */}
          <Route path="soforler" element={<DriversListPage />} />
          <Route path="soforler/:id" element={<DriverDetailPage />} />
          
          {/* Documents Archive */}
          <Route path="belgeler" element={<DocumentsPage />} />
          
          {/* Reports */}
          <Route path="raporlar" element={<ReportsPage />} />
          
          {/* Import */}
          <Route path="ice-aktar" element={<ImportHubPage />} />
          
          {/* License & Settings */}
          <Route path="lisans" element={<LicensePage />} />
          <Route path="ayarlar" element={<SettingsPage />} />

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;