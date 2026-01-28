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
    Info
} from 'lucide-react';
import { usersService } from '@/services/usersService';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

const RESOURCES = [
    { id: 'tests', label: 'Gestion des Tests', icon: FlaskConical, desc: 'Contrôles et interventions industrielles' },
    { id: 'non_conformites', label: 'Non-Conformités', icon: AlertTriangle, desc: 'Gestion des écarts et plans d\'action' },
    { id: 'equipements', label: 'Parc Équipements', icon: Settings, desc: 'Configuration et suivi des machines' },
    { id: 'rapports', label: 'Centre de Rapports', icon: FileText, desc: 'Génération et archivage de documents' },
    { id: 'users', label: 'Gestion Personnel', icon: Users, desc: 'Comptes utilisateurs et RH' },
    { id: 'instruments', label: 'Métrologie', icon: Activity, desc: 'Instruments de mesure et calibration' },
];

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-gray-900">
                        <ShieldCheck className="h-8 w-8 text-indigo-600" />
                        Matrice des Access
                    </h1>
                    <p className="text-gray-500 font-medium italic text-sm mt-1">Configurez les droits d'accès par rôle métier</p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner">
                    {roles?.map((role: any) => (
                        <button
                            key={role.id_role}
                            onClick={() => setSelectedRoleId(role.id_role)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                (selectedRoleId === role.id_role || (!selectedRoleId && roles[0].id_role === role.id_role))
                                    ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {role.nom_role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Warning for Admin */}
            {selectedRole?.nom_role === 'Admin' && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 mb-6">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-amber-900 uppercase">Attention : Rôle Super-Administrateur</p>
                        <p className="text-[10px] text-amber-700 font-medium mt-1">
                            Le rôle Admin possède des privilèges absolus par défaut. Les permissions affichées ici sont indicatives
                            car le système bypass toutes les restrictions pour ce rôle.
                        </p>
                    </div>
                </div>
            )}

            {/* Matrix Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-r border-gray-50">
                                    Modules & Ressources
                                </th>
                                {ACTIONS.map(action => (
                                    <th key={action.id} className="px-6 py-6 text-center">
                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{action.label}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {RESOURCES.map((res) => (
                                <tr key={res.id} className="group hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-8 py-6 border-r border-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                                                <res.icon className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">{res.label}</p>
                                                <p className="text-[10px] text-gray-400 font-medium italic">{res.desc}</p>
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
                                                        "h-10 w-10 mx-auto rounded-full flex items-center justify-center transition-all border-2",
                                                        active
                                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100"
                                                            : "bg-white border-gray-100 text-gray-200 hover:border-gray-300 hover:text-gray-300"
                                                    )}
                                                >
                                                    {active ? <Check className="h-5 w-5 stroke-[4]" /> : <X className="h-5 w-5" />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Matrice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-indigo-900 text-white rounded-3xl shadow-xl shadow-indigo-100">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="h-6 w-6 text-indigo-300" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Utilisateurs Affectés</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">{selectedRole?.personnels_count || 0}</span>
                        <span className="text-xs font-bold text-indigo-300 uppercase">Salariés actifs</span>
                    </div>
                    <p className="text-[10px] text-indigo-200 font-medium mt-4 italic">
                        Tous ces utilisateurs héritent instantanément des règles définies dans cette matrice.
                    </p>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-indigo-600" />
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Principe de Sécurité</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Les modifications portées à cette matrice sont journalisées. Un rôle sans aucune permission cochée
                            ne pourra pas voir le module associé dans la barre de navigation latérale.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Synchronisation Backend Active
                    </div>
                </div>
            </div>
        </div>
    );
}
