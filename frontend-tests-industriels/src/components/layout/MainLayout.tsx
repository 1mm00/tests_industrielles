import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FlaskConical,
    AlertTriangle,
    Calendar,
    BarChart3,
    LogOut,
    X,
    User,
    Wrench,
    Users,
    ChevronDown,
    ChevronRight,
    Menu,
    Microscope,
    Activity,
    Layers,
    ShieldCheck,
    Zap,
    ClipboardList,
    ShieldAlert,
    FileBarChart
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/helpers';
import Navbar from '../Navbar/Navbar';
import TestCreationModal from '../modals/TestCreationModal';
import NcCreationModal from '../modals/NcCreationModal';
import ReportCreationModal from '../modals/ReportCreationModal';
import UserCreationModal from '../modals/UserCreationModal';
import TestExecutionModal from '../modals/TestExecutionModal';
import NcEditModal from '../modals/NcEditModal';
import EquipementEditModal from '../modals/EquipementEditModal';
import EquipementCreationModal from '../modals/EquipementCreationModal';
import EquipementDetailsModal from '../modals/EquipementDetailsModal';
import InstrumentCreationModal from '../modals/InstrumentCreationModal';
import InstrumentDetailsModal from '../modals/InstrumentDetailsModal';

import TypeTestModal from '../modals/TypeTestModal';
import MethodDesignerModal from '../modals/MethodDesignerModal';
import ProfileEditModal from '../modals/ProfileEditModal';
import TestReportGmailModal from '../modals/TestReportGmailModal';
import TestDetailsModal from '../modals/TestDetailsModal';
import NcDetailsModal from '../modals/NcDetailsModal';

import { hasModuleAccess, hasPermission } from '@/utils/permissions';
import { authService } from '@/services/authService';

interface MainLayoutProps {
    children: ReactNode;
}

interface NavItem {
    name: string;
    href?: string;
    icon?: any;
    resource?: string; // Ressource spécifique pour l'item
    children?: { name: string; href: string, resource?: string }[];
}

interface NavGroup {
    title: string;
    items: NavItem[];
    resource?: string; // Si présent, le groupe entier est soumis à cette permission
}

const navGroups: NavGroup[] = [
    {
        title: 'Maîtrise Opérationnelle',
        items: [
            { name: 'Tableau de bord', href: '/', icon: LayoutDashboard, resource: 'dashboards' },
        ]
    },
    {
        title: 'Contrôles & Qualité',
        items: [
            {
                name: 'Tests Industriels',
                href: '/tests',
                icon: FlaskConical,
                resource: 'tests'
            },
            {
                name: 'Non-Conformités',
                icon: AlertTriangle,
                resource: 'non_conformites',
                children: [
                    { name: 'Journal des NC', href: '/non-conformites', resource: 'non_conformites' },
                    { name: 'Statistiques Qualité', href: '/nc-stats', resource: 'non_conformites' },
                ]
            },
            {
                name: 'Gestion Référentiels',
                icon: Layers,
                resource: 'tests',
                children: [
                    { name: 'Types de Tests', href: '/type-tests', resource: 'tests' },
                ]
            },
            {
                name: 'Parc Équipements',
                icon: Wrench,
                resource: 'equipements',
                children: [
                    { name: 'Liste équipements', href: '/equipements', resource: 'equipements' },
                    { name: 'Instrumentation', href: '/instruments', resource: 'instruments' },
                    { name: 'Alertes Métrologie', href: '/calibration-alerts', resource: 'instruments' },
                ]
            },
        ]
    },
    {
        title: 'Planification',
        items: [
            {
                name: 'Planning & Calendrier',
                icon: Calendar,
                resource: 'planning',
                children: [
                    { name: 'Vue Calendrier', href: '/planning-calendar', resource: 'planning' },
                ]
            },
            {
                name: 'Reporting & KPIs',
                icon: BarChart3,
                resource: 'rapports',
                children: [
                    { name: 'Tableau Bord Performance', href: '/reporting-dashboard', resource: 'rapports' },
                    { name: 'Registre des Rapports', href: '/reports', resource: 'rapports' },
                ]
            },
        ]
    },
    {
        title: 'Ingénierie & Expertise',
        resource: 'expertise',
        items: [
            { name: 'Dashboard Industriel', href: '/engineer/dashboard', icon: Activity, resource: 'expertise' },
            { name: 'Analyses Équipements', href: '/engineer/analyses', icon: Microscope, resource: 'expertise' },
            { name: 'Orchestration Tests', href: '/engineer/projets', icon: Layers, resource: 'expertise' },
            { name: 'Gestion des Protocoles', href: '/engineer/protocoles', icon: FlaskConical, resource: 'expertise' },
        ]
    },
    {
        title: 'Zone Technique',
        resource: 'maintenance',
        items: [
            { name: 'Dashboard Opérationnel', href: '/technician/dashboard', icon: Zap, resource: 'maintenance' },
            { name: 'Exécution des Tests', href: '/technician/tests', icon: ClipboardList, resource: 'maintenance' },
            {
                name: 'Signaler une NC', icon: ShieldAlert, resource: 'non_conformites', children: [
                    { name: 'Signaler une NC', href: '/technician/non-conformites', resource: 'non_conformites' }
                ]
            },
            {
                name: 'Catalogue Actifs', icon: Microscope, resource: 'equipements', children: [
                    { name: 'Catalogue Actifs', href: '/technician/equipements', resource: 'equipements' }
                ]
            },
            {
                name: 'Archives Rapports', icon: FileBarChart, resource: 'rapports', children: [
                    { name: 'Archives Rapports', href: '/technician/rapports', resource: 'rapports' }
                ]
            },
        ]
    },
    {
        title: 'Administration Système',
        resource: 'users',
        items: [
            { name: 'Gestion des Utilisateurs', href: '/users', icon: Users, resource: 'personnel' },
            { name: 'Matrice des Permissions', href: '/roles-permissions', icon: ShieldCheck, resource: 'users' },
        ]
    },
    {
        title: 'Paramètres Compte',
        items: [
            { name: 'Mon Profil Industriel', href: '/profile', icon: User },
        ]
    }
];

export default function MainLayout({ children }: MainLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, login, logout } = useAuthStore();

    // EFFET DE SYNCHRONISATION : Rafraîchit les permissions du Backend au montage
    useEffect(() => {
        const syncUser = async () => {
            try {
                const data = await authService.me();
                if (data.user) {
                    login(data.user, useAuthStore.getState().token || '');
                }
            } catch (error) {
                console.error("Erreur de synchronisation des permissions:", error);
            }
        };
        syncUser();
    }, []);

    // FILTRAGE ULTRA-STRICT DE LA SIDEBAR
    const filteredNavGroups = navGroups.filter(group => {
        if (user?.personnel?.role?.nom_role?.toLowerCase() === 'admin') return true;

        if (group.resource && !hasModuleAccess(user, group.resource)) {
            return false;
        }

        const authorizedItems = group.items.filter(item => {
            if (item.resource) {
                return hasModuleAccess(user, item.resource);
            }
            return true;
        });

        return authorizedItems.length > 0;
    });


    const toggleMenu = (name: string) => {
        setOpenMenus(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderNavItem = (item: NavItem, isMobile = false) => {
        if (item.resource && !hasModuleAccess(user, item.resource)) {
            return null;
        }

        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus.includes(item.name);
        const isActive = item.href ? location.pathname === item.href : false;

        const allowedChildren = item.children?.filter(child =>
            !child.resource || hasPermission(user, child.resource, 'read')
        );

        if (hasChildren && allowedChildren && allowedChildren.length > 0) {
            const isChildActive = allowedChildren.some(child => location.pathname === child.href);
            return (
                <div key={item.name} className="space-y-1">
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className={cn(
                            'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isChildActive
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-100'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className="h-4.5 w-4.5" />
                            <span>{item.name}</span>
                        </div>
                        {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                    {isOpen && (
                        <div className="pl-11 space-y-1">
                            {allowedChildren.map((child) => {
                                const isSubActive = location.pathname === child.href;
                                return (
                                    <Link
                                        key={child.name}
                                        to={child.href}
                                        onClick={() => isMobile && setSidebarOpen(false)}
                                        className={cn(
                                            'block px-3 py-2 rounded-md text-sm transition-colors',
                                            isSubActive
                                                ? 'text-primary-600 font-semibold'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-primary-50/50'
                                        )}
                                    >
                                        {child.name}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        if (hasChildren && (!allowedChildren || allowedChildren.length === 0)) {
            return null;
        }

        return (
            <Link
                key={item.name}
                to={item.href || '#'}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                )}
            >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar pour mobile et tablette */}
            <div className={cn(
                'fixed inset-0 z-50 xl:hidden',
                sidebarOpen ? 'block' : 'hidden'
            )}>
                <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-full max-w-xs md:max-w-sm bg-white shadow-xl">
                    <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
                        <div className="flex items-center">
                            <FlaskConical className="h-6 w-6 text-primary-600" />
                            <span className="ml-2 text-lg font-bold">Industrial Test</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] scrollbar-hide">
                        {filteredNavGroups.map((group) => (
                            <div key={group.title} className="space-y-2">
                                <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {group.title}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map(item => renderNavItem(item, true))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Sidebar Desktop et Large Tablet - Floating Card Style */}
            <aside className="fixed top-4 bottom-4 left-4 z-40 w-20 lg:w-[240px] xl:w-[260px] bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl hidden lg:flex overflow-hidden border border-slate-200 flex-col transition-all duration-500 group/sidebar hover:w-[260px]">
                {/* Logo & User profile section at top */}
                <div className="p-4 lg:p-6 pb-2 flex flex-col items-center text-center bg-gradient-to-b from-primary-50/50 to-transparent">
                    <div className="h-12 w-12 lg:h-14 lg:w-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-2 transition-all duration-300 group-hover/sidebar:h-16 group-hover/sidebar:w-16">
                        <User className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                    </div>
                    <div className="hidden lg:block group-hover/sidebar:block opacity-0 lg:opacity-100 group-hover/sidebar:opacity-100 transition-all duration-300">
                        <h2 className="text-xs font-black text-gray-900 truncate max-w-[180px]">
                            {user?.personnel ? `${user.personnel.prenom} ${user.personnel.nom}` : user?.name}
                        </h2>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.15em] mt-1">
                            {user?.personnel?.role?.nom_role || 'ADMINISTRATEUR'}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-4 px-3 lg:px-4 py-3 overflow-y-auto scrollbar-hide">
                    {filteredNavGroups.map((group) => (
                        <div key={group.title} className="space-y-2">
                            <h3 className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 hidden lg:block group-hover/sidebar:block">
                                {group.title}
                            </h3>
                            <div className="space-y-0.5">
                                {group.items.map(item => (
                                    <div key={item.name} className="relative group/navitem">
                                        {renderNavItem(item)}
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible lg:hidden group-hover/sidebar:hidden transition-all z-50 whitespace-nowrap">
                                            {item.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout at bottom */}
                <div className="p-4 xl:p-6 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all group"
                    >
                        <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col lg:pl-24 xl:pl-72 transition-all duration-500">
                <div className="lg:hidden flex h-12 items-center justify-between px-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-primary-600" />
                        <span className="font-black text-xs uppercase tracking-widest text-gray-900">Industrial Test</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>

                <Navbar />

                {/* Page content container */}
                <main className="flex-1 w-full max-w-[1440px] mx-auto p-3 md:p-4 lg:p-6 pt-4 lg:pt-24 transition-all duration-300">
                    {children}
                </main>

                {/* Modals Globaux */}
                <TestCreationModal />
                <NcCreationModal />
                <ReportCreationModal />
                <UserCreationModal />
                <TestExecutionModal />
                <NcEditModal />
                <EquipementEditModal />
                <EquipementCreationModal />
                <EquipementDetailsModal />
                <InstrumentCreationModal />
                <InstrumentDetailsModal />
                <TypeTestModal />
                <MethodDesignerModal />
                <ProfileEditModal />
                <TestReportGmailModal />
                <TestDetailsModal />
                <NcDetailsModal />
            </div>
        </div >
    );
}
