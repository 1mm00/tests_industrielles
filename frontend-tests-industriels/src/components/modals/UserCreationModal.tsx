import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserPlus,
    X,
    Save,
    Mail,
    Phone,
    User as UserIcon,
    Briefcase,
    Building2,
    Calendar,
    Shield,
    Hash,
    AlertCircle,
    Edit3
} from 'lucide-react';
import { usersService } from '@/services/usersService';
import { useModalStore } from '@/store/modalStore';

export default function UserCreationModal() {
    const queryClient = useQueryClient();
    const { isUserModalOpen, closeUserModal, selectedUser } = useModalStore();

    const [form, setForm] = useState({
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        poste: '',
        departement: '',
        role_id: '',
        date_embauche: new Date().toISOString().split('T')[0],
        actif: true,
    });

    useEffect(() => {
        if (selectedUser) {
            setForm({
                matricule: selectedUser.matricule || '',
                nom: selectedUser.nom || '',
                prenom: selectedUser.prenom || '',
                email: selectedUser.email || '',
                telephone: selectedUser.telephone || '',
                poste: selectedUser.poste || '',
                departement: selectedUser.departement || '',
                role_id: selectedUser.role_id || '',
                date_embauche: selectedUser.date_embauche ? new Date(selectedUser.date_embauche).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                actif: selectedUser.actif !== undefined ? selectedUser.actif : true,
            });
        } else {
            setForm({
                matricule: '',
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
                poste: '',
                departement: '',
                role_id: '',
                date_embauche: new Date().toISOString().split('T')[0],
                actif: true,
            });
        }
    }, [selectedUser, isUserModalOpen]);

    // Fetch roles for selection
    const { data: rolesData } = useQuery({
        queryKey: ['roles-list'],
        queryFn: () => usersService.getRoles(),
        enabled: isUserModalOpen,
    });

    // Fetch postes for selection
    const { data: postesData } = useQuery({
        queryKey: ['postes-list'],
        queryFn: () => usersService.getPostes(),
        enabled: isUserModalOpen,
    });

    // Fetch départements for selection
    const { data: departementsData } = useQuery({
        queryKey: ['departements-list'],
        queryFn: () => usersService.getDepartements(),
        enabled: isUserModalOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => selectedUser
            ? usersService.updateUser(selectedUser.id_personnel, data)
            : usersService.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['users-stats'] });
            closeUserModal();
            alert(selectedUser ? 'Utilisateur mis à jour avec succès !' : 'Utilisateur créé avec succès !');
        },
        onError: (error: any) => {
            console.error('Erreur:', error.response?.data);
            alert(`Erreur: ${error.response?.data?.message || 'Une erreur est survenue.'}`);
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setForm(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation basique
        if (!form.nom || !form.prenom || !form.email || !form.matricule) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            alert('Veuillez entrer une adresse email valide');
            return;
        }

        createMutation.mutate(form);
    };

    if (!isUserModalOpen) return null;

    const isEditing = !!selectedUser;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase flex items-center gap-2">
                            {isEditing ? <Edit3 className="h-6 w-6 text-primary-600" /> : <UserPlus className="h-6 w-6 text-primary-600" />}
                            {isEditing ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {isEditing ? 'Édition du compte personnel' : "Création d'un compte personnel"}
                        </p>
                    </div>
                    <button
                        onClick={closeUserModal}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="user-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Matricule */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="h-3 w-3" />
                                Matricule *
                            </label>
                            <input
                                type="text"
                                name="matricule"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Ex: EMP-001"
                                value={form.matricule}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Rôle */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                Rôle
                            </label>
                            <select
                                name="role_id"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.role_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un rôle</option>
                                {rolesData?.map((role: any) => (
                                    <option key={role.id_role} value={role.id_role}>
                                        {role.nom_role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nom */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserIcon className="h-3 w-3" />
                                Nom *
                            </label>
                            <input
                                type="text"
                                name="nom"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Nom de famille"
                                value={form.nom}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Prénom */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserIcon className="h-3 w-3" />
                                Prénom *
                            </label>
                            <input
                                type="text"
                                name="prenom"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Prénom"
                                value={form.prenom}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="email@entreprise.com"
                                value={form.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Téléphone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                name="telephone"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="+33 6 12 34 56 78"
                                value={form.telephone}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Poste */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                Poste *
                            </label>
                            <select
                                name="poste"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.poste}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un poste</option>
                                {postesData?.map((poste: any) => (
                                    <option key={poste.id} value={poste.libelle}>
                                        {poste.libelle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Département */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                Département
                            </label>
                            <select
                                name="departement"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.departement}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un département</option>
                                {departementsData?.map((dept: any) => (
                                    <option key={dept.id} value={dept.libelle}>
                                        {dept.libelle} {dept.site && `(${dept.site})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date d'embauche */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Date d'embauche
                            </label>
                            <input
                                type="date"
                                name="date_embauche"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.date_embauche}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Statut Actif */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    name="actif"
                                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={form.actif}
                                    onChange={handleInputChange}
                                />
                                <span className="text-sm font-bold text-gray-700">Compte actif</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-amber-900 uppercase">Information</p>
                            <p className="text-[10px] text-amber-700 font-medium italic mt-1">
                                Un compte utilisateur et un dossier personnel seront créés automatiquement.
                                Le mot de passe par défaut sera envoyé par email.
                            </p>
                        </div>
                    </div>
                </form>

                {/* Footer Modal */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={closeUserModal}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-widest"
                    >
                        Annuler
                    </button>
                    <button
                        form="user-form"
                        type="submit"
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-black text-sm shadow-xl shadow-primary-100 disabled:opacity-50 disabled:grayscale"
                    >
                        {createMutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isEditing ? 'Mise à jour...' : 'Création...'}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {isEditing ? 'Mettre à jour' : "Créer l'Utilisateur"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
