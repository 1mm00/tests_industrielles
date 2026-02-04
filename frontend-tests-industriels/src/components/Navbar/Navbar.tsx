import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    ShieldCheck,
    Activity,
    Database,
    Zap,
    Plus,
    LogOut,
    User as UserIcon,
    Moon,
    FlaskConical,
    FileBarChart,
    AlertTriangle,
    CheckCircle2,
    Info,
    ChevronDown,
    Sun
} from 'lucide-react';
import { hasPermission } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/helpers';
import { systemService } from '@/services/systemService';
import { useModalStore } from '@/store/modalStore';
import { useThemeStore } from '@/store/themeStore';

interface NavbarProps {
    // unused
}

export default function Navbar({ }: NavbarProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const [scrolled, setScrolled] = useState(false);

    // States for dropdowns
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLElement>(null);
    const { openTestModal, openNcModal, openReportModal } = useModalStore();

    // Fetch real data
    const { data: health } = useQuery({
        queryKey: ['system-health'],
        queryFn: () => systemService.getHealth(),
        refetchInterval: 30000, // Sync every 30s
    });

    const { data: notifications } = useQuery({
        queryKey: ['system-notifications'],
        queryFn: () => systemService.getNotifications(),
        refetchInterval: 60000, // Refresh every minute
    });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = (name: string) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header
            ref={navRef}
            className={cn(
                "fixed top-4 left-[316px] right-6 z-50 transition-all duration-500 hidden lg:block",
                scrolled ? "top-2" : "top-4"
            )}
        >
            <div className={cn(
                "mx-auto w-full transition-all duration-500 rounded-3xl border shadow-2xl flex items-center justify-between px-10 py-3.5 hover:shadow-primary-100/50 hover:scale-[1.005]",
                scrolled
                    ? "bg-white/95 backdrop-blur-xl border-slate-200"
                    : "bg-white/70 backdrop-blur-md border-slate-200/50"
            )}>
                {/* Section Gauche - Logo/Titre discret */}
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                        <FlaskConical className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Tests Industriels</span>
                </div>

                {/* Section Centrale - Navigation Menu Rapide Dynamique (Basé sur les Permissions) */}
                <nav className="hidden xl:flex items-center gap-8 bg-gray-100/50 px-6 py-2 rounded-full border border-gray-200/50">
                    <button onClick={() => navigate('/')} className="text-xs font-black text-primary-600 uppercase tracking-widest">Dashboard</button>

                    {hasPermission(user, 'tests', 'read') && (
                        <button onClick={() => navigate('/tests')} className="text-xs font-black text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-widest">Tests</button>
                    )}

                    {hasPermission(user, 'maintenance', 'read') && (
                        <button onClick={() => navigate('/technician/tests')} className="text-xs font-black text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-widest">Terrain</button>
                    )}

                    {hasPermission(user, 'expertise', 'read') && (
                        <button onClick={() => navigate('/engineer/projets')} className="text-xs font-black text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-widest">Ingénierie</button>
                    )}

                    {hasPermission(user, 'non_conformites', 'read') && (
                        <button onClick={() => navigate('/non-conformites')} className="text-xs font-black text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-widest">Qualité</button>
                    )}

                    {hasPermission(user, 'users', 'read') && (
                        <button onClick={() => navigate('/users')} className="text-xs font-black text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-widest">Équipe</button>
                    )}

                    {hasPermission(user, 'rapports', 'read') && (
                        <button onClick={() => navigate('/reports')} className="text-xs font-black text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-widest">Documents</button>
                    )}
                </nav>

                {/* Section Droite - Actions & Profil */}
                <div className="flex items-center gap-4">

                    {/* 2. System Health Indicator */}
                    <div className="hidden md:flex items-center gap-4 bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100 mr-2 relative group/health">
                        <div className="flex items-center gap-2 cursor-help" onClick={() => toggleDropdown('health')}>
                            <div className="relative flex h-2 w-2">
                                <span className={cn(
                                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                    health?.status === 'OK' ? "bg-green-400" : "bg-red-400"
                                )}></span>
                                <span className={cn(
                                    "relative inline-flex rounded-full h-2 w-2",
                                    health?.status === 'OK' ? "bg-green-500" : "bg-red-500"
                                )}></span>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Système {health?.status || 'CHECKING...'}
                            </span>
                        </div>

                        {activeDropdown === 'health' && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-black text-gray-900 uppercase mb-3 flex items-center gap-2">
                                    <ShieldCheck className={cn("h-4 w-4", health?.status === 'OK' ? "text-green-500" : "text-red-500")} />
                                    État du Système
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Database className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-600">Base de données</span>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black",
                                            health?.components.database === 'ONLINE' ? "text-green-600" : "text-red-600"
                                        )}>{health?.components.database || 'WAITING'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-600">API Gateway</span>
                                        </div>
                                        <span className="text-[10px] font-black text-green-600">{health?.components.latency || '0.0ms'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-600">Stockage</span>
                                        </div>
                                        <span className="text-[10px] font-black text-green-600">{health?.components.storage || 'ONLINE'}</span>
                                    </div>
                                </div>
                                <p className="mt-4 pt-4 border-t border-gray-50 text-[8px] font-bold text-gray-400 uppercase text-center italic">
                                    MAJ: {health?.last_sync}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 3. Notification Center */}
                    <div className="relative">
                        <button
                            onClick={() => toggleDropdown('notifications')}
                            className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all border border-gray-100 relative"
                        >
                            <Bell className="h-5 w-5" />
                            {notifications && notifications.length > 0 && (
                                <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {activeDropdown === 'notifications' && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                                    <h4 className="text-xs font-black text-gray-900 uppercase">Centre d'Alertes</h4>
                                    <button className="text-[10px] font-bold text-primary-600 hover:underline">Tout marquer lu</button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications && notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer">
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                                        notif.type === 'error' ? "bg-red-50 text-red-500" :
                                                            notif.type === 'warning' ? "bg-orange-50 text-orange-500" :
                                                                notif.type === 'success' ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                                                    )}>
                                                        {notif.type === 'error' ? <AlertTriangle className="h-4 w-4" /> :
                                                            notif.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                                                                notif.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-gray-900 leading-tight">{notif.title}</p>
                                                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{notif.description}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 font-bold">{notif.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                                <Bell className="h-6 w-6" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-400">Aucune nouvelle notification</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => navigate('/notifications')} className="w-full py-3 bg-gray-50 text-[10px] font-black uppercase text-gray-500 hover:bg-gray-100 transition-colors">
                                    Voir tout l'historique
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 4. Smart Action Button - Affiché si l'utilisateur a au moin un droit de création */}
                    {(hasPermission(user, 'tests', 'create') ||
                        hasPermission(user, 'non_conformites', 'create') ||
                        hasPermission(user, 'rapports', 'create')) && (
                            <div className="relative hidden sm:block">
                                <button
                                    onClick={() => toggleDropdown('actions')}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-bold text-sm shadow-lg shadow-gray-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    Action
                                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                </button>

                                {activeDropdown === 'actions' && (
                                    <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 gap-1">
                                            {(hasPermission(user, 'tests', 'create')) && (
                                                <button
                                                    onClick={() => {
                                                        setActiveDropdown(null);
                                                        openTestModal();
                                                    }}
                                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-black uppercase text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-all text-left"
                                                >
                                                    <FlaskConical className="h-4 w-4 text-primary-500" />
                                                    Nouveau Test
                                                </button>
                                            )}
                                            {(hasPermission(user, 'non_conformites', 'create')) && (
                                                <button
                                                    onClick={() => {
                                                        setActiveDropdown(null);
                                                        openNcModal();
                                                    }}
                                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-black uppercase text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-all text-left"
                                                >
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    Déclarer une NC
                                                </button>
                                            )}
                                            {(hasPermission(user, 'rapports', 'create')) && (
                                                <button
                                                    onClick={() => {
                                                        setActiveDropdown(null);
                                                        openReportModal();
                                                    }}
                                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-black uppercase text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-all text-left"
                                                >
                                                    <FileBarChart className="h-4 w-4 text-blue-500" />
                                                    Générer Rapport
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                    {/* 5. User Card Avancée */}
                    <div className="relative group/user">
                        <button
                            onClick={() => toggleDropdown('user')}
                            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                        >
                            <div className="hidden text-right sm:block">
                                <p className="text-[11px] font-black text-gray-900 leading-none">{user?.prenom} {user?.nom}</p>
                                <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-1 leading-none">{user?.personnel?.role?.nom_role || 'ADMINISTRATEUR'}</p>
                            </div>
                            <div className="h-9 w-9 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-black text-sm border-2 border-white shadow-sm overflow-hidden ring-1 ring-gray-100">
                                {user?.prenom?.[0]}{user?.nom?.[0]}
                            </div>
                        </button>

                        {activeDropdown === 'user' && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-12 w-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-100">
                                            {user?.prenom?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 leading-none">{user?.prenom} {user?.nom}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{user?.fonction || user?.personnel?.role?.nom_role || 'Agent Industriel'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-100">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider italic">Session: Active</span>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1 bg-green-50/50 rounded-lg border border-green-100/50">
                                            <span className="text-[9px] font-bold text-green-600 uppercase">Statut Opérationnel</span>
                                            <span className="text-[9px] font-black text-green-700 uppercase">Connecté</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button onClick={() => navigate('/profile')} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all text-left">
                                        <UserIcon className="h-4 w-4 text-primary-500" />
                                        Mon Profil Industriel
                                    </button>
                                    <button
                                        onClick={toggleDarkMode}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all text-left group/mode"
                                    >
                                        {isDarkMode ? (
                                            <>
                                                <Sun className="h-4 w-4 text-yellow-500 group-hover:rotate-12 transition-transform" />
                                                Mode Clair
                                            </>
                                        ) : (
                                            <>
                                                <Moon className="h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                                                Mode Sombre
                                            </>
                                        )}
                                    </button>
                                    <div className="h-px bg-gray-50 my-1 mx-2" />
                                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-black text-red-500 hover:bg-red-50 transition-all text-left">
                                        <LogOut className="h-4 w-4" />
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
