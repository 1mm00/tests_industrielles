import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users,
    UserPlus,
    ShieldCheck,
    UserMinus,
    Search,
    Filter,
    Mail,
    Phone,
    Briefcase,
    Building2,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Edit2,
    Trash2
} from 'lucide-react';
import { usersService, type UserPersonnel } from '@/services/usersService';
import { cn } from '@/utils/helpers';
import { useModalStore } from '@/store/modalStore';

export default function UsersPage() {
    const queryClient = useQueryClient();
    const { openUserModal } = useModalStore();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => usersService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['users-stats'] });
            alert('Utilisateur supprimé avec succès');
        },
        onError: (error: any) => {
            alert('Erreur lors de la suppression: ' + (error.response?.data?.message || 'Erreur inconnue'));
        }
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${name} ?`)) {
            deleteMutation.mutate(id);
        }
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-gray-900">
                        <ShieldCheck className="h-8 w-8 text-primary-600" />
                        Gestion des Utilisateurs
                    </h1>
                    <p className="text-gray-500 font-medium italic text-sm mt-1">Contrôle des accès et annuaire du personnel industriel</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, matricule..."
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={openUserModal}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-bold text-sm shadow-md shadow-gray-300"
                    >
                        <UserPlus className="h-4 w-4" />
                        Ajouter Utilisateur
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                            <Users className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Personnel</p>
                    </div>
                    <h4 className="text-3xl font-black text-gray-900">{stats?.total || 0}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Actifs</p>
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 text-green-600">{stats?.actifs || 0}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <UserMinus className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Inactifs</p>
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 text-red-600">{stats?.inactifs || 0}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Secteurs</p>
                    </div>
                    <h4 className="text-3xl font-black text-gray-900">{stats?.by_departement.length || 0}</h4>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg">Annuaire des Utilisateurs</h3>
                    <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filtres avancés
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identité / Matricule</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Affectation</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : users?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <Users className="h-16 w-16 mb-4" />
                                            <p className="font-bold text-lg">Aucun utilisateur trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users?.map((user: UserPersonnel) => (
                                    <tr key={user.id_personnel} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-black text-sm border border-primary-200">
                                                    {user.nom.charAt(0)}{user.prenom.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{user.nom} {user.prenom}</p>
                                                    <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{user.matricule}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    {user.email}
                                                </div>
                                                {user.telephone && (
                                                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                                                        <Phone className="h-3 w-3" />
                                                        {user.telephone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                                    {user.poste}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase mt-0.5 ml-5">{user.departement || "Siège"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border flex items-center gap-1.5 w-fit",
                                                user.actif
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-red-50 text-red-700 border-red-200"
                                            )}>
                                                {user.actif ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {user.actif ? "Actif" : "Inactif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openUserModal(user)}
                                                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary-600 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id_personnel, `${user.prenom} ${user.nom}`)}
                                                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-600 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-900 transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
