import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import { hasModuleAccess, hasPermission } from '@/utils/permissions';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/admin/Dashboard';
import TestsPage from '@/pages/tests/TestsPage';
import NonConformitesPage from '@/pages/non-conformites/NonConformitesPage';
import NonConformitesStatsPage from '@/pages/non-conformites/NonConformitesStatsPage';
import EquipementsPage from '@/pages/equipements/EquipementsPage';
import InstrumentsPage from '@/pages/instruments/InstrumentsPage';
import CalibrationAlertsPage from '@/pages/instruments/CalibrationAlertsPage';
import PlanningCalendarPage from '@/pages/planning/PlanningCalendarPage';
import ReportingDashboardPage from '@/pages/reporting/ReportingDashboardPage';
import ReportsPage from '@/pages/reporting/ReportsPage';
import UsersPage from '@/pages/admin/Users';
import PermissionsManagerPage from '@/pages/admin/PermissionsManagerPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import ReportingPage from '@/pages/ReportingPage';
import MissionControlPage from './pages/planning/MissionControlPage';

import Dashboard_Engineer from '@/pages/ingenieur/Dashboard_Engineer';
import Analyses_Engineer from '@/pages/ingenieur/Analyses_Engineer';
import Projets_Engineer from '@/pages/ingenieur/Projets_Engineer';
import ProtocolManagementPage from '@/pages/ingenieur/ProtocolManagementPage';
import Dashboard_Technician from '@/pages/technicien/Dashboard_Technician';
import Tests_Technician from '@/pages/technicien/Tests_Technician';
import NonConformites_Technician from '@/pages/technicien/NonConformites_Technician';
import Equipements_Technician from '@/pages/technicien/Equipements_Technician';
import Rapports_Technician from '@/pages/technicien/Rapports_Technician';
import Dashboard_Reader from '@/pages/lecteur/Dashboard_Reader';
import AuditLogsPage from '@/pages/admin/AuditLogsPage';
import SystemSettingsPage from '@/pages/admin/SystemSettingsPage';
import MaintenancePage from '@/pages/equipements/MaintenancePage';
import { Toaster } from 'react-hot-toast';

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



/**
 * Composant pour protéger les routes par permission granulaire
 */
interface PermissionRouteProps {
    children: React.ReactNode;
    resource: string;
    action: string;
}

function PermissionRoute({ children, resource, action }: PermissionRouteProps) {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!hasPermission(user, resource, action)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

import TypeTestsPage from '@/pages/tests/TypeTestsPage';

function App() {
    const { user } = useAuthStore();

    /**
     * Rendu dynamique du Dashboard basé sur la Matrice des Permissions
     * Le rôle (nom) ne définit plus l'interface, ce sont les droits réels.
     */
    const renderDynamicDashboard = () => {
        // 1. Priorité aux outils d'administration ou dashboards globaux
        if (hasModuleAccess(user, 'users') || hasModuleAccess(user, 'dashboards')) {
            return <DashboardPage />;
        }

        // 2. Interface Ingénierie & Expertise
        if (hasModuleAccess(user, 'expertise')) {
            return <Dashboard_Engineer />;
        }

        // 3. Interface Maintenance & Terrain
        if (hasModuleAccess(user, 'maintenance')) {
            return <Dashboard_Technician />;
        }

        // 4. Par défaut : Interface de consultation (Lecteur)
        return <Dashboard_Reader />;
    };

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Toaster position="top-right" reverseOrder={false} />
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
                                    {renderDynamicDashboard()}
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    {/* Routes Ingénieur Spécifiques */}
                    <Route
                        path="/engineer/dashboard"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <Dashboard_Engineer />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/engineer/analyses"
                        element={
                            <PermissionRoute resource="equipements" action="read">
                                <MainLayout>
                                    <Analyses_Engineer />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/engineer/projets"
                        element={
                            <PermissionRoute resource="tests" action="read">
                                <MainLayout>
                                    <Projets_Engineer />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/engineer/protocoles"
                        element={
                            <PermissionRoute resource="tests" action="read">
                                <MainLayout>
                                    <ProtocolManagementPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    {/* Routes Technicien Spécifiques */}
                    <Route
                        path="/technician/dashboard"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <Dashboard_Technician />
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/technician/tests"
                        element={
                            <PermissionRoute resource="tests" action="read">
                                <MainLayout>
                                    <Tests_Technician />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />
                    <Route
                        path="/technician/non-conformites"
                        element={
                            <PermissionRoute resource="non_conformites" action="read">
                                <MainLayout>
                                    <NonConformites_Technician />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />
                    <Route
                        path="/technician/equipements"
                        element={
                            <PermissionRoute resource="equipements" action="read">
                                <MainLayout>
                                    <Equipements_Technician />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />
                    <Route
                        path="/technician/rapports"
                        element={
                            <PermissionRoute resource="rapports" action="read">
                                <MainLayout>
                                    <Rapports_Technician />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />


                    <Route
                        path="/tests"
                        element={
                            <PermissionRoute resource="tests" action="read">
                                <MainLayout>
                                    <TestsPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/type-tests"
                        element={
                            <PermissionRoute resource="tests" action="read">
                                <MainLayout>
                                    <TypeTestsPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />


                    <Route
                        path="/equipements/maintenance"
                        element={
                            <PermissionRoute resource="equipements" action="read">
                                <MainLayout>
                                    <MaintenancePage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/equipements"
                        element={
                            <PermissionRoute resource="equipements" action="read">
                                <MainLayout>
                                    <EquipementsPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/non-conformites"
                        element={
                            <PermissionRoute resource="non_conformites" action="read">
                                <MainLayout>
                                    <NonConformitesPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/nc-stats"
                        element={
                            <PermissionRoute resource="non_conformites" action="read">
                                <MainLayout>
                                    <NonConformitesStatsPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/instruments"
                        element={
                            <PermissionRoute resource="instruments" action="read">
                                <MainLayout>
                                    <InstrumentsPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/calibration-alerts"
                        element={
                            <PermissionRoute resource="instruments" action="read">
                                <MainLayout>
                                    <CalibrationAlertsPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/planning-calendar"
                        element={
                            <PermissionRoute resource="rapports" action="read">
                                <MainLayout>
                                    <PlanningCalendarPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/reporting-dashboard"
                        element={
                            <PermissionRoute resource="rapports" action="read">
                                <MainLayout>
                                    <ReportingDashboardPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <PermissionRoute resource="rapports" action="read">
                                <MainLayout>
                                    <ReportsPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/mission-control"
                        element={
                            <PermissionRoute resource="rapports" action="read">
                                <MainLayout>
                                    <MissionControlPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/kpis"
                        element={
                            <PermissionRoute resource="rapports" action="read">
                                <MainLayout>
                                    <ReportingPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/users"
                        element={
                            <PermissionRoute resource="personnel" action="read">
                                <MainLayout>
                                    <UsersPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="/audit-logs"
                        element={
                            <PermissionRoute resource="personnel" action="read">
                                <MainLayout>
                                    <AuditLogsPage />
                                </MainLayout>
                            </PermissionRoute>
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
                        path="/roles-permissions"
                        element={
                            <PermissionRoute resource="users" action="read">
                                <MainLayout>
                                    <PermissionsManagerPage />
                                </MainLayout>
                            </PermissionRoute>
                        }
                    />



                    <Route
                        path="/settings"
                        element={
                            <PermissionRoute resource="personnel" action="read">
                                <MainLayout>
                                    <SystemSettingsPage />
                                </MainLayout>
                            </PermissionRoute>
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
