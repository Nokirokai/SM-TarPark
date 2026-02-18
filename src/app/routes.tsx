import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './layouts/DashboardLayout';
import { RootLayout } from './layouts/RootLayout';

// Pages
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { PublicDashboard } from './pages/PublicDashboard';
import { TollDashboard } from './pages/TollDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VehiclesPage } from './pages/VehiclesPage';
import { ViolationsPage } from './pages/ViolationsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { SlotsPage } from './pages/SlotsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFound } from './pages/NotFound';
import { HelpPage } from './pages/HelpPage';
import { DebugAuth } from './pages/DebugAuth';

// Wrapper components for toll routes
function TollDashboardPage() {
  return <DashboardLayout role="toll"><TollDashboard /></DashboardLayout>;
}

function TollSlotsPage() {
  return <DashboardLayout role="toll"><SlotsPage /></DashboardLayout>;
}

function TollVehiclesPage() {
  return <DashboardLayout role="toll"><VehiclesPage /></DashboardLayout>;
}

function TollViolationsPage() {
  return <DashboardLayout role="toll"><ViolationsPage /></DashboardLayout>;
}

function TollPaymentsPage() {
  return <DashboardLayout role="toll"><PaymentsPage /></DashboardLayout>;
}

function TollReportsPage() {
  return <DashboardLayout role="toll"><ReportsPage /></DashboardLayout>;
}

function TollSettingsPage() {
  return <DashboardLayout role="toll"><SettingsPage /></DashboardLayout>;
}

// Wrapper components for admin routes
function AdminDashboardPage() {
  return <DashboardLayout role="admin"><AdminDashboard /></DashboardLayout>;
}

function AdminSlotsPage() {
  return <DashboardLayout role="admin"><SlotsPage /></DashboardLayout>;
}

function AdminVehiclesPage() {
  return <DashboardLayout role="admin"><VehiclesPage /></DashboardLayout>;
}

function AdminViolationsPage() {
  return <DashboardLayout role="admin"><ViolationsPage /></DashboardLayout>;
}

function AdminPaymentsPage() {
  return <DashboardLayout role="admin"><PaymentsPage /></DashboardLayout>;
}

function AdminReportsPage() {
  return <DashboardLayout role="admin"><ReportsPage /></DashboardLayout>;
}

function AdminSettingsPage() {
  return <DashboardLayout role="admin"><SettingsPage /></DashboardLayout>;
}

function ProfilePageWrapper() {
  return <DashboardLayout role="toll"><ProfilePage /></DashboardLayout>;
}

function VehiclesPageWrapper() {
  return <DashboardLayout role="toll"><VehiclesPage /></DashboardLayout>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        path: 'login',
        Component: Login
      },
      {
        path: 'auth/callback',
        Component: AuthCallback
      },
      {
        path: 'public',
        Component: PublicDashboard
      },
      {
        path: 'toll',
        Component: TollDashboardPage
      },
      {
        path: 'toll/slots',
        Component: TollSlotsPage
      },
      {
        path: 'toll/vehicles',
        Component: TollVehiclesPage
      },
      {
        path: 'toll/violations',
        Component: TollViolationsPage
      },
      {
        path: 'toll/payments',
        Component: TollPaymentsPage
      },
      {
        path: 'toll/reports',
        Component: TollReportsPage
      },
      {
        path: 'toll/settings',
        Component: TollSettingsPage
      },
      {
        path: 'admin',
        Component: AdminDashboardPage
      },
      {
        path: 'admin/slots',
        Component: AdminSlotsPage
      },
      {
        path: 'admin/vehicles',
        Component: AdminVehiclesPage
      },
      {
        path: 'admin/violations',
        Component: AdminViolationsPage
      },
      {
        path: 'admin/payments',
        Component: AdminPaymentsPage
      },
      {
        path: 'admin/reports',
        Component: AdminReportsPage
      },
      {
        path: 'admin/settings',
        Component: AdminSettingsPage
      },
      {
        path: 'profile',
        Component: ProfilePageWrapper
      },
      {
        path: 'vehicles',
        Component: VehiclesPageWrapper
      },
      {
        path: 'help',
        Component: HelpPage
      },
      {
        path: 'debug/auth',
        Component: DebugAuth
      },
      {
        index: true,
        Component: PublicDashboard
      },
      {
        path: '*',
        Component: NotFound
      }
    ]
  }
]);