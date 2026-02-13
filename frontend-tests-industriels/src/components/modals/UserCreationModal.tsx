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
    Edit3
} from 'lucide-react';
import { usersService } from '@/services/usersService';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';

export default function UserCreationModal() {
    const queryClient = useQueryClient();
    const { isUserModalOpen, closeUserModal, selectedUser } = useModalStore();

    const [form, setForm] = useState({
        cin: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        poste_id: '',
        departement_id: '',
        role_id: '',
        date_embauche: new Date().toISOString().split('T')[0],
        actif: true,
    });

    useEffect(() => {
        if (selectedUser) {
            setForm({
                cin: selectedUser.cin || '',
                nom: selectedUser.nom || '',
                prenom: selectedUser.prenom || '',
                email: selectedUser.email || '',
                telephone: selectedUser.telephone || '',
                poste_id: selectedUser.poste_id || '',
                departement_id: selectedUser.departement_id || '',
                role_id: selectedUser.role_id || '',
                date_embauche: selectedUser.date_embauche ? new Date(selectedUser.date_embauche).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                actif: selectedUser.actif !== undefined ? selectedUser.actif : true,
            });
        } else {
            setForm({
                cin: '',
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
                poste_id: '',
                departement_id: '',
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

    // Fetch postes for selection (filtered by role)
    const { data: postesData } = useQuery({
        queryKey: ['postes-list', form.role_id],
        queryFn: () => usersService.getPostes(form.role_id || undefined),
        enabled: isUserModalOpen,
    });

    // Fetch départements for selection (filtered by role and poste)
    const { data: departementsData } = useQuery({
        queryKey: ['departements-list', form.role_id, form.poste_id],
        queryFn: () => usersService.getDepartements(form.role_id || undefined, form.poste_id || undefined),
        enabled: isUserModalOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => {
            const userId = selectedUser?.id_personnel || selectedUser?.id;
            if (isEditing && !userId) {
                throw new Error("ID de l'utilisateur manquant");
            }
            return isEditing
                ? usersService.updateUser(userId, data)
                : usersService.createUser(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['users-stats'] });
            closeUserModal();
            toast.success(selectedUser ? 'Utilisateur mis à jour avec succès !' : 'Utilisateur créé avec succès !');
        },
        onError: (error: any) => {
            console.error('Erreur mutation:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Une erreur est survenue.';
            toast.error(`Erreur: ${errorMsg}`);
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name === 'cin') {
            const newEmail = value.toLowerCase() + '@testindustrielle.com';
            setForm(prev => ({ ...prev, cin: val, email: newEmail }));
        }
        else if (name === 'role_id') {
            const cin = form.cin;
            const newEmail = cin ? cin.toLowerCase() + '@testindustrielle.com' : '';
            setForm(prev => ({ ...prev, [name]: val, poste_id: '', departement_id: '', email: newEmail }));
        } else if (name === 'poste_id') {
            setForm(prev => ({ ...prev, [name]: val, departement_id: '' }));
        } else {
            setForm(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation basique
        if (!form.cin || !form.nom || !form.prenom || !form.poste_id) {
            toast.error('Veuillez remplir tous les champs obligatoires (CIN, Nom, Prénom, Poste)');
            return;
        }

        createMutation.mutate(form);
    };

    if (!isUserModalOpen) return null;

    const isEditing = !!selectedUser;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[10px] animate-in fade-in duration-200">
            <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
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
                        {/* CIN */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="h-3 w-3" />
                                CIN (Carte d'Identité Nationale) *
                            </label>
                            <input
                                type="text"
                                name="cin"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Ex: Z1234"
                                value={form.cin}
                                onChange={handleInputChange}
                            />
                            {isEditing && selectedUser?.matricule ? (
                                <p className="text-[9px] text-green-600 font-bold">✓ Matricule attribué : {selectedUser.matricule}</p>
                            ) : (
                                <p className="text-[9px] text-gray-400 italic">L'email sera généré automatiquement : {form.cin.toLowerCase() || '___'}@testindustrielle.com</p>
                            )}
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

                        {/* Email (Auto-généré) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                Email (Généré automatiquement)
                            </label>
                            <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">
                                {form.email || 'Saisissez un CIN pour générer l\'email'}
                            </div>
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
                                name="poste_id"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.poste_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un poste</option>
                                {postesData?.map((poste: any) => (
                                    <option key={poste.id_poste} value={poste.id_poste}>
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
                                name="departement_id"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={form.departement_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Sélectionner un département</option>
                                {departementsData?.map((dept: any) => (
                                    <option key={dept.id_departement} value={dept.id_departement}>
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
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-black text-sm shadow-xl shadow-blue-100 disabled:opacity-50 disabled:grayscale"

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
