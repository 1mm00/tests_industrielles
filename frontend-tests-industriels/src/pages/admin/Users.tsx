import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users as UsersIcon,
    UserPlus,
    ShieldCheck,
    UserMinus,
    Filter,
    Mail,
    Phone,
    Briefcase,
    Building2,
    Edit2,
    Trash2,
    Download,
    ChevronRight,
    Search as SearchIcon,
    UserCheck,
    Fingerprint
} from 'lucide-react';
import { usersService, type UserPersonnel } from '@/services/usersService';
import { cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';
import { exportToPDF } from '@/utils/pdfExport';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function UsersPage() {
    const queryClient = useQueryClient();
    const { openUserModal } = useModalStore();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => usersService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['users-stats'] });
            toast.success('Utilisateur archivé avec succès');
        },
        onError: (error: any) => {
            toast.error('Erreur lors de la suppression: ' + (error.response?.data?.message || 'Erreur inconnue'));
        }
    });

    const handleDelete = (user: UserPersonnel) => {
        const id = user.id_personnel || (user as any).id;
        if (!id) return;

        toast((t) => (
            <div className="flex flex-col gap-4 p-1 min-w-[280px]">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 uppercase">Révoquer l'accès ?</p>
                        <p className="text-[10px] text-gray-500 font-bold">{user.matricule}</p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    Cette action désactivera les accès de {user.prenom} {user.nom}. Son matricule et son historique resteront conservés dans l'infrastructure de traçabilité.
                </p>

                <div className="flex gap-2 justify-end pt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            deleteMutation.mutate(id);
                        }}
                        className="px-5 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
            style: {
                borderRadius: '24px',
                background: '#fff',
                padding: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #fee2e2'
            },
        });
    };

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users-list'],
        queryFn: () => usersService.getUsers(),
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['users-stats'],
        queryFn: () => usersService.getUserStats(),
    });

    const isLoading = usersLoading || statsLoading;

    const handleExportPDF = () => {
        if (!users) return;

        const headers = ["Matricule", "Nom Complet", "Email", "Poste", "Département", "Statut"];
        const body = users.map((u: any) => [
            u.matricule,
            `${u.nom} ${u.prenom}`,
            u.email,
            u.poste_rel?.libelle || "N/A",
            u.departement?.libelle || "N/A",
            u.actif ? "ACTIF" : "INACTIF"
        ]);

        exportToPDF({
            title: "Annuaire du Personnel & Infrastructure Humaine",
            filename: "registre_personnel",
            headers: headers,
            body: body,
            orientation: 'l'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12">

            {/* 1. Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100 group hover:rotate-6 transition-transform">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            Gestion Utilisateurs
                        </h1>
                        <p className="text-sm text-slate-500 font-medium italic">Contrôle des accès et orchestration de l'infrastructure humaine</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2.5 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-black text-[11px] uppercase tracking-widest shadow-sm active:scale-95"
                    >
                        <Download className="h-4 w-4 text-indigo-600" />
                        <span className="hidden sm:inline">Export PDF</span>
                    </button>
                    <button
                        onClick={() => openUserModal()}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 group"
                    >
                        <UserPlus className="h-4 w-4 group-hover:rotate-12 transition-transform duration-500" />
                        Ajouter Utilisateur
                    </button>
                </div>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <UsersIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Personnel</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats?.total || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                        <div className="h-full bg-slate-400 rounded-r-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profils Actifs</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{stats?.actifs || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-50">
                        <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${stats?.total ? (stats.actifs / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <UserMinus className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inactifs</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{stats?.inactifs || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-50">
                        <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${stats?.total ? (stats.inactifs / stats.total) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secteurs Nodes</p>
                            <h3 className="text-2xl font-black text-indigo-600 mt-0.5">{stats?.by_departement?.length || 0}</h3>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-50">
                        <div className="h-full bg-indigo-500 rounded-r-full" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>

            {/* 3. Search & Quick Filters Bar */}
            <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher par nom, matricule, poste..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12.5px] font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select className="flex-1 md:w-48 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none focus:bg-white transition-all">
                        <option>Tous les statuts</option>
                        <option>Actifs Uni</option>
                        <option>Restreints</option>
                    </select>
                </div>
            </div>

            {/* 4. Main Table */}
            <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Identité / Matricule</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Contact Core</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Affectation Node</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Statut Access</th>
                                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-7 py-6"><div className="h-10 bg-slate-50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : users?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-7 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Fingerprint className="h-16 w-16 text-slate-300" />
                                            <p className="text-slate-500 font-black uppercase tracking-[3px] text-xs">Aucun profil identifié</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users?.map((user: UserPersonnel, idx: number) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        key={user.id_personnel}
                                        className="hover:bg-slate-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-600"
                                    >
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-[13px] border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                                                    {user.nom.charAt(0)}{user.prenom.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-black text-slate-800 uppercase tracking-tight">{user.nom} {user.prenom}</p>
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] mt-0.5">{user.matricule}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                    {user.email}
                                                </div>
                                                {user.telephone && (
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                                        <Phone className="h-3 w-3" />
                                                        {user.telephone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-[12px] font-black text-slate-700">
                                                    <Briefcase className="h-4 w-4 text-slate-300" />
                                                    {user.poste_rel?.libelle || "Non Assigné"}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                                    <Building2 className="h-3 w-3 opacity-50" />
                                                    {user.departement?.libelle || "Infrastructure Core"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex items-center justify-center">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border flex items-center gap-2 transition-all",
                                                    user.actif
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-100"
                                                        : "bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-100"
                                                )}>
                                                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", user.actif ? "bg-emerald-500" : "bg-rose-500")} />
                                                    {user.actif ? "Node Actif" : "Node Inactif"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openUserModal(user)}
                                                    className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-amber-600 hover:border-amber-100 hover:shadow-lg hover:shadow-amber-100 rounded-xl transition-all"
                                                    title="Modifier Profil"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:shadow-lg hover:shadow-rose-100 rounded-xl transition-all"
                                                    title="Révoquer Access"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-indigo-600 transition-all">
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Metrics Footer */}
                {!isLoading && users && users.length > 0 && (
                    <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Synchronisation Annuaire Industrielle : {users.length} Experts Répertoriés
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all opacity-50 cursor-not-allowed">
                                Précèdent
                            </button>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all opacity-50 cursor-not-allowed">
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
