import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShieldCheck,
    Check,
    X,
    AlertCircle,
    FlaskConical,
    AlertTriangle,
    Settings,
    FileText,
    Users,
    Activity,
    Info,
    LayoutDashboard,
    Microscope,
    Calendar,
    Shield,
    User,
    BookOpen,
    Cpu,
    Database,
    FileCheck,
    Zap,
    ChevronRight,
    Circle,
    Fingerprint
} from 'lucide-react';
import { usersService } from '@/services/usersService';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RESOURCES = [
    { id: 'dashboards', label: 'Tableaux de Bord', icon: LayoutDashboard, desc: 'Accès aux synthèses et overview', boxColor: 'bg-indigo-50 text-indigo-600' },
    { id: 'tests', label: 'Gestion des Tests', icon: FlaskConical, desc: 'Contrôles et interventions industrielles', boxColor: 'bg-blue-50 text-blue-600' },
    { id: 'non_conformites', label: 'Non-Conformités', icon: AlertTriangle, desc: 'Gestion des écarts et plans d\'action', boxColor: 'bg-amber-50 text-amber-600' },
    { id: 'equipements', label: 'Parc Équipements', icon: Database, desc: 'Configuration et suivi des machines', boxColor: 'bg-indigo-50 text-indigo-600' },
    { id: 'rapports', label: 'Centre de Rapports', icon: FileCheck, desc: 'Génération et archivage de documents', boxColor: 'bg-indigo-50 text-indigo-600' },
    { id: 'personnel', label: 'Gestion Personnel', icon: Users, desc: 'Comptes utilisateurs et RH', boxColor: 'bg-slate-50 text-slate-600' },
    { id: 'instruments', label: 'Métrologie', icon: Activity, desc: 'Instruments de mesure et calibration', boxColor: 'bg-emerald-50 text-emerald-600' },
    { id: 'expertise', label: 'Ingénierie & Expertise', icon: Microscope, desc: 'Protocoles avancés et orchestration', boxColor: 'bg-indigo-50 text-indigo-600' },
    { id: 'maintenance', label: 'Zone Technique', icon: Activity, desc: 'Exécution terrain et maintenance', boxColor: 'bg-rose-50 text-rose-600' },
    { id: 'planning', label: 'Planning & Calendrier', icon: Calendar, desc: 'Interventions et rendez-vous', boxColor: 'bg-indigo-50 text-indigo-600' },
    { id: 'users', label: 'Permissions & Rôles', icon: ShieldCheck, desc: 'Configuration de la sécurité système', boxColor: 'bg-slate-900 text-white' },
];

const ROLE_CONFIG: Record<string, { icon: any, color: string }> = {
    'Admin': { icon: Shield, color: 'text-indigo-600' },
    'Technicien': { icon: User, color: 'text-blue-600' },
    'Lecteur': { icon: BookOpen, color: 'text-slate-600' },
    'Ingénieur': { icon: Cpu, color: 'text-indigo-600' },
};

/**
 * Configuration de la pertinence des ressources par rôle.
 * Définit quelles lignes s'affichent dans la matrice pour chaque profil.
 */
const ROLE_RESOURCES_RELEVANCE: Record<string, string[]> = {
    'Admin': [
        'dashboards', 'tests', 'non_conformites', 'equipements', 'rapports',
        'personnel', 'instruments', 'expertise', 'maintenance', 'users'
    ],
    'Ingénieur': [
        'dashboards', 'tests', 'non_conformites', 'equipements', 'rapports',
        'instruments', 'expertise'
    ],
    'Technicien': [
        'dashboards', 'tests', 'non_conformites', 'equipements', 'rapports',
        'instruments', 'maintenance'
    ],
    'Lecteur': [
        'dashboards', 'tests', 'non_conformites', 'equipements', 'rapports', 'instruments'
    ],
};

const ACTIONS = [
    { id: 'read', label: 'Lecture' },
    { id: 'create', label: 'Création' },
    { id: 'update', label: 'Édition' },
    { id: 'delete', label: 'Suppres.' },
];

export default function PermissionsManagerPage() {
    const queryClient = useQueryClient();
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

    const { data: roles, isLoading } = useQuery({
        queryKey: ['roles-permissions'],
        queryFn: () => usersService.getRoles(),
    });

    const updateMutation = useMutation({
        mutationFn: ({ roleId, permissions }: { roleId: string, permissions: any }) =>
            usersService.updateRolePermissions(roleId, permissions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles-permissions'] });
            toast.success('Matrice de permissions mise à jour avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de la mise à jour des permissions');
        }
    });

    const selectedRole = roles?.find((r: any) => r.id_role === selectedRoleId) || (roles ? roles[0] : null);

    const togglePermission = (resource: string, action: string) => {
        if (!selectedRole) return;

        const currentPermissions = { ...(selectedRole.permissions || {}) };
        const resourceActions = [...(currentPermissions[resource] || [])];

        if (resourceActions.includes(action)) {
            const index = resourceActions.indexOf(action);
            resourceActions.splice(index, 1);
        } else {
            resourceActions.push(action);
        }

        currentPermissions[resource] = resourceActions;

        updateMutation.mutate({
            roleId: selectedRole.id_role,
            permissions: currentPermissions
        });
    };

    const hasPermission = (resource: string, action: string) => {
        if (!selectedRole) return false;
        if (selectedRole.nom_role === 'Admin') return true;
        return selectedRole.permissions?.[resource]?.includes(action);
    };

    // Filtrage dynamique des ressources affichées selon le rôle sélectionné
    const filteredResources = RESOURCES.filter(res => {
        if (!selectedRole) return true;
        const allowed = ROLE_RESOURCES_RELEVANCE[selectedRole.nom_role];
        if (!allowed) return true;
        return allowed.includes(res.id);
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-20">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Calcul de la matrice d'accès...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">

            {/* 1. Header Area & Role Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 group hover:rotate-6 transition-transform">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Matrice des Access
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                            <Fingerprint className="h-3 w-3 text-indigo-500" />
                            Gouvernance et privilèges de la sécurité industrielle
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 p-2 bg-white/50 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    {roles?.map((role: any) => {
                        const config = ROLE_CONFIG[role.nom_role] || { icon: Shield, color: 'text-slate-600' };
                        const isActive = selectedRoleId === role.id_role || (!selectedRoleId && roles[0].id_role === role.id_role);
                        return (
                            <button
                                key={role.id_role}
                                onClick={() => setSelectedRoleId(role.id_role)}
                                className={cn(
                                    "relative px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-500 active:scale-95 group",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-2xl shadow-slate-300"
                                        : "hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <config.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-slate-400")} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{role.nom_role}</span>

                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="absolute -top-2 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-[7px] font-black text-white px-2 py-0.5 rounded-full border border-white shadow-lg uppercase tracking-widest"
                                        >
                                            Rôle Actif
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Warning for Admin */}
            <AnimatePresence mode="wait">
                {selectedRole?.nom_role === 'Admin' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-5 bg-amber-50/50 backdrop-blur-md border border-amber-100/50 rounded-[2rem] flex items-start gap-5 mb-8 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-3xl -mr-12 -mt-12" />
                        <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                            <Info className="h-6 w-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="h-3 w-3 fill-current" />
                                Rôle Super-Administrateur Détecté
                            </p>
                            <p className="text-[10px] text-amber-700/80 font-bold uppercase tracking-tight mt-1 leading-relaxed">
                                Le rôle Admin possède des privilèges absolus bypassant toute restriction.
                                Les switches ci-dessous sont verrouillés sur "Actif" pour préserver l'intégrité du système racine.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Matrix Table Content */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-none">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                    Modules & Ressources Infrastructure
                                </th>
                                {ACTIONS.map(action => (
                                    <th key={action.id} className="px-6 py-8 text-center min-w-[120px]">
                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{action.label}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredResources.map((res, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={res.id}
                                    className="group hover:bg-slate-50/80 transition-all duration-300"
                                >
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                                                res.boxColor
                                            )}>
                                                <res.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{res.label}</p>
                                                    <ChevronRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic mt-0.5 opacity-60 leading-none">{res.desc}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {ACTIONS.map(action => {
                                        const active = hasPermission(res.id, action.id);
                                        const isAdmin = selectedRole?.nom_role === 'Admin';

                                        return (
                                            <td key={action.id} className="px-6 py-6 text-center">
                                                <button
                                                    onClick={() => !isAdmin && togglePermission(res.id, action.id)}
                                                    disabled={isAdmin || updateMutation.isPending}
                                                    className={cn(
                                                        "relative h-12 w-12 mx-auto rounded-full flex items-center justify-center transition-all duration-500 active:scale-90",
                                                        isAdmin ? "cursor-not-allowed" : "cursor-pointer"
                                                    )}
                                                >
                                                    {active ? (
                                                        <div className="relative group/check">
                                                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150 animate-pulse" />
                                                            <div className="relative h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border-2 border-emerald-400 group-hover/check:scale-110 transition-transform">
                                                                <Check className="h-5 w-5 text-white stroke-[4]" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center border-2 border-slate-100 hover:border-slate-300 transition-all hover:bg-white group/circle">
                                                            <Circle className="h-4 w-4 text-slate-200 group-hover/circle:text-slate-400" />
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Status Footer Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-12">

                {/* Affected Users Card */}
                <div className="md:col-span-12 lg:col-span-7 p-10 bg-indigo-950/95 backdrop-blur-xl text-white rounded-[3rem] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -ml-16 -mb-16" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                        <div className="space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                                    <Users className="h-7 w-7 text-indigo-300" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-widest">Utilisateurs Affectés</h3>
                            </div>
                            <div className="flex items-baseline gap-4 mt-2">
                                <span className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-400">
                                    {selectedRole?.personnels_count || 0}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">Salariés Actifs</span>
                                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Sur ce profil métier</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:max-w-xs">
                            <p className="text-sm font-medium text-indigo-100/70 italic leading-relaxed">
                                "Tous les analystes et experts affectés à ce node héritent instantanément des privilèges de sécurité définis dans cette matrice logicielle."
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Propagation temps réel active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Principle Card */}
                <div className="md:col-span-12 lg:col-span-5 p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden group border-l-[12px] border-l-indigo-600">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div>
                        <div className="flex items-center gap-5 mb-8">
                            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Principe de Sécurité OS</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-tight opacity-70">
                            Les modifications portées à cette matrice sont journalisées électroniquement.
                            Un rôle sans aucune permission ne pourra pas visualiser les modules dans l'interface de pilotage.
                        </p>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connectivité Core</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[9px] font-black text-emerald-600 uppercase tracking-widest shadow-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Synchronisation Backend OK
                            </div>
                        </div>
                    </div>

                    <ChevronRight className="absolute bottom-6 right-6 h-10 w-10 text-slate-100 group-hover:text-indigo-100 group-hover:translate-x-2 transition-all duration-700" />
                </div>
            </div>
        </div>
    );
}
