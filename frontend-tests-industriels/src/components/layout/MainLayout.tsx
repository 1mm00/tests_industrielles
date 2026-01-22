import { ReactNode, useState } from 'react';
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
    Menu
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/helpers';
import Navbar from './Navbar';
import TestCreationModal from '../modals/TestCreationModal';
import NcCreationModal from '../modals/NcCreationModal';
import ReportCreationModal from '../modals/ReportCreationModal';
import UserCreationModal from '../modals/UserCreationModal';

interface MainLayoutProps {
    children: ReactNode;
}

interface NavItem {
    name: string;
    href?: string;
    icon?: any;
    children?: { name: string; href: string }[];
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: 'Menu Principal',
        items: [
            { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
        ]
    },
    {
        title: 'Opérations Industrielles',
        items: [
            {
                name: 'Tests Industriels',
                href: '/tests',
                icon: FlaskConical,
            },
            {
                name: 'Non-Conformités',
                icon: AlertTriangle,
                children: [
                    { name: 'Liste des NC', href: '/non-conformites' },
                    { name: 'Statistiques NC', href: '/nc-stats' },
                ]
            },
            {
                name: 'Équipements & Instruments',
                icon: Wrench,
                children: [
                    { name: 'Liste équipements', href: '/equipements' },
                    { name: 'Liste instruments', href: '/instruments' },
                    { name: 'Alertes calibration', href: '/calibration-alerts' },
                ]
            },
        ]
    },
    {
        title: 'Planification & Analyse',
        items: [
            {
                name: 'Planning & Calendrier',
                icon: Calendar,
                children: [
                    { name: 'Planning mensuel', href: '/planning-calendar' },
                ]
            },
            {
                name: 'Reporting & KPIs',
                icon: BarChart3,
                children: [
                    { name: 'Dashboard performance', href: '/reporting-dashboard' },
                    { name: 'Liste des rapports', href: '/reports' },
                ]
            },
        ]
    },
    {
        title: 'Administration',
        items: [
            { name: 'Gestion utilisateurs', href: '/users', icon: Users },
        ]
    },
    {
        title: 'Extras',
        items: [
            { name: 'Profil', href: '/profile', icon: User },
        ]
    }
];

export default function MainLayout({ children }: MainLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

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
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus.includes(item.name);
        const isActive = item.href ? location.pathname === item.href : false;
        const isChildActive = item.children?.some(child => location.pathname === child.href);

        if (hasChildren) {
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
                            {item.children?.map((child) => {
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
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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

        return (
            <Link
                key={item.name}
                to={item.href || '#'}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
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
                    <nav className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
                        {navGroups.map((group) => (
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
            <aside className="fixed top-6 bottom-6 left-6 z-40 w-[260px] xl:w-[280px] bg-white rounded-[2rem] xl:rounded-[2.5rem] shadow-2xl hidden xl:flex overflow-hidden border border-gray-100 flex-col">
                {/* Logo & User profile section at top */}
                <div className="p-6 xl:p-8 pb-4 flex flex-col items-center text-center">
                    <div className="h-16 w-16 xl:h-20 xl:w-20 bg-gray-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3 xl:mb-4">
                        <User className="h-8 w-8 xl:h-10 xl:w-10 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-sm xl:text-base font-bold text-gray-700">{user?.prenom} {user?.nom}</h2>
                        <p className="text-[11px] font-medium text-primary-600 uppercase tracking-wider mt-1">{user?.fonction || 'Administrateur'}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-5 xl:space-y-7 px-4 xl:px-6 py-4 overflow-y-auto scrollbar-hide">
                    {navGroups.map((group) => (
                        <div key={group.title} className="space-y-3">
                            <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map(item => renderNavItem(item))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout at bottom */}
                <div className="p-4 xl:p-6 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-all group"
                    >
                        <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col xl:pl-[300px] 2xl:pl-[320px]">
                {/* Mobile and Tablet Navbar (Only visible on small screens) */}
                <div className="xl:hidden flex h-16 items-center justify-between px-4 md:px-6 bg-white border-b border-gray-100 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-6 w-6 text-primary-600" />
                        <span className="font-bold text-gray-900">Tests Industriels</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                <Navbar />

                {/* Page content container */}
                <main className="p-4 md:p-6 xl:p-8 pt-6 xl:pt-28">
                    {children}
                </main>

                {/* Modals Globaux */}
                <TestCreationModal />
                <NcCreationModal />
                <ReportCreationModal />
                <UserCreationModal />
            </div>
        </div>
    );
}
