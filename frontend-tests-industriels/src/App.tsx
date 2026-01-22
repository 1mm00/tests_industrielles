import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

// Layouts
import MainLayout from '@/components/layout/MainLayout';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import TestsPage from '@/pages/tests/TestsPage';
import NonConformitesPage from '@/pages/non-conformites/NonConformitesPage';
import NonConformitesStatsPage from '@/pages/non-conformites/NonConformitesStatsPage';
import EquipementsPage from '@/pages/equipements/EquipementsPage';
import InstrumentsPage from '@/pages/instruments/InstrumentsPage';
import CalibrationAlertsPage from '@/pages/instruments/CalibrationAlertsPage';
import PlanningCalendarPage from '@/pages/planning/PlanningCalendarPage';
import ReportingDashboardPage from '@/pages/reporting/ReportingDashboardPage';
import ReportsPage from '@/pages/reporting/ReportsPage';
import UsersPage from '@/pages/users/UsersPage';
import ProfilePage from '@/pages/profile/ProfilePage';

// Créer le Query Client pour React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Composant pour protéger les routes authentifiées
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Composant pour rediriger si déjà authentifié
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Routes protégées */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/tests"
            element={
              <PrivateRoute>
                <MainLayout>
                  <TestsPage />
                </MainLayout>
              </PrivateRoute>
            }
          />


          <Route
            path="/equipements"
            element={
              <PrivateRoute>
                <MainLayout>
                  <EquipementsPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/non-conformites"
            element={
              <PrivateRoute>
                <MainLayout>
                  <NonConformitesPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/nc-stats"
            element={
              <PrivateRoute>
                <MainLayout>
                  <NonConformitesStatsPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/instruments"
            element={
              <PrivateRoute>
                <MainLayout>
                  <InstrumentsPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/calibration-alerts"
            element={
              <PrivateRoute>
                <MainLayout>
                  <CalibrationAlertsPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/rapports"
            element={
              <PrivateRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Page Rapports</h1>
                    <p className="text-gray-600 mt-2">À venir...</p>
                  </div>
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/planning"
            element={<Navigate to="/planning-calendar" replace />}
          />

          <Route
            path="/planning-calendar"
            element={
              <PrivateRoute>
                <MainLayout>
                  <PlanningCalendarPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/reporting-dashboard"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ReportingDashboardPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ReportsPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/users"
            element={
              <PrivateRoute>
                <MainLayout>
                  <UsersPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/kpis"
            element={
              <PrivateRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Page KPIs</h1>
                    <p className="text-gray-600 mt-2">À venir...</p>
                  </div>
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Page Paramètres</h1>
                    <p className="text-gray-600 mt-2">À venir...</p>
                  </div>
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Route 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Page non trouvée</p>
                  <a href="/" className="btn-primary mt-6 inline-flex">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
