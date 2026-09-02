import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout, PublicLayout } from './layouts';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyWizardPage } from './pages/PropertyWizardPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { TenantsPage } from './pages/TenantsPage';
import { TenantFormPage } from './pages/TenantFormPage';
import { TenantDetailPage } from './pages/TenantDetailPage';
import { LeasesPage } from './pages/LeasesPage';
import { LeaseFormPage } from './pages/LeaseFormPage';
import { LeaseDetailPage } from './pages/LeaseDetailPage';
import { RentPage } from './pages/RentPage';
import { FinancesPage } from './pages/FinancesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { CalendarPage } from './pages/CalendarPage';
import { ContactsPage } from './pages/ContactsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { SecurityPage } from './pages/SecurityPage';
import { HelpPage } from './pages/HelpPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CookiesPage } from './pages/CookiesPage';
import { SuperadminPage } from './pages/SuperadminPage';

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/tarifs" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Route>
      <Route path="/superadmin" element={<SuperadminPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/new" element={<PropertyWizardPage />} />
        <Route path="properties/:id" element={<PropertyDetailPage />} />
        <Route path="properties/:id/edit" element={<PropertyWizardPage />} />
        <Route path="finances" element={<FinancesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="tenants/new" element={<TenantFormPage />} />
        <Route path="tenants/:id" element={<TenantDetailPage />} />
        <Route path="tenants/:id/edit" element={<TenantFormPage />} />
        <Route path="leases" element={<LeasesPage />} />
        <Route path="leases/new" element={<LeaseFormPage />} />
        <Route path="leases/:id" element={<LeaseDetailPage />} />
        <Route path="leases/:id/edit" element={<LeaseFormPage />} />
        <Route path="rent" element={<RentPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
    </Routes>
  );
}
