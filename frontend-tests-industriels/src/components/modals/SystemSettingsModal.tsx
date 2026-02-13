import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsService } from '@/services/settingsService';
import { usersService } from '@/services/usersService';
import toast from 'react-hot-toast';

interface SystemSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'normes' | 'departements' | 'postes';
    initialData?: any;
    onSuccess: () => void;
}

const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({ isOpen, onClose, type, initialData, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>(initialData || {});
    const [roles, setRoles] = useState<any[]>([]);
    const [personnel, setPersonnel] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || { actif: true, statut: 'ACTIF' });
            if (type === 'postes') fetchRoles();
            if (type === 'departements') fetchPersonnel();
        }
    }, [isOpen, initialData, type]);

    const fetchRoles = async () => {
        try {
            const data = await usersService.getRoles();
            setRoles(data);
        } catch (error) { }
    };

    const fetchPersonnel = async () => {
        try {
            const data = await usersService.getUsers();
            setPersonnel(data);
        } catch (error) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (type === 'normes') {
                if (initialData?.id_norme) await settingsService.updateNorme(initialData.id_norme, formData);
                else await settingsService.createNorme(formData);
            } else if (type === 'departements') {
                if (initialData?.id_departement) await settingsService.updateDepartement(initialData.id_departement, formData);
                else await settingsService.createDepartement(formData);
            } else {
                if (initialData?.id_poste) await settingsService.updatePoste(initialData.id_poste, formData);
                else await settingsService.createPoste(formData);
            }
            toast.success("Enregistrement réussi");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
                >
                    {/* Header */}
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {initialData ? 'Modifier' : 'Ajouter'} {type === 'normes' ? 'une Norme' : type === 'departements' ? 'un Département' : 'un Poste'}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuration du référentiel système</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-2 gap-6">
                            {type === 'normes' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code Norme</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.code_norme || ''}
                                            onChange={(e) => setFormData({ ...formData, code_norme: e.target.value })}
                                            placeholder="ex: ISO 9001:2015"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.titre || ''}
                                            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                            placeholder="Système de management de la qualité"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organisme</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.organisme_emission || ''}
                                            onChange={(e) => setFormData({ ...formData, organisme_emission: e.target.value })}
                                            placeholder="ISO, AFNOR, IEEE..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.categorie || ''}
                                            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                                            placeholder="Qualité, Sécurité, Environnement..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all appearance-none"
                                            value={formData.statut || 'ACTIF'}
                                            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                                        >
                                            <option value="ACTIF">Actif / Certifié</option>
                                            <option value="OBSOLETE">Obsolète</option>
                                            <option value="EN_REVISION">En Révision</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Version</label>
                                        <input
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.version || ''}
                                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                            placeholder="2015, 2022..."
                                        />
                                    </div>
                                </>
                            )}

                            {type === 'departements' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code Département</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.code_departement || ''}
                                            onChange={(e) => setFormData({ ...formData, code_departement: e.target.value })}
                                            placeholder="ex: PRD-01"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Libellé</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.libelle || ''}
                                            onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                                            placeholder="ex: Production Assemblage"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsable</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all appearance-none"
                                            value={formData.responsable_id || ''}
                                            onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                                        >
                                            <option value="">Sélectionner un responsable</option>
                                            {personnel.map(p => (
                                                <option key={p.id_personnel} value={p.id_personnel}>{p.prenom} {p.nom} - {p.poste}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {type === 'postes' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code Poste</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.code_poste || ''}
                                            onChange={(e) => setFormData({ ...formData, code_poste: e.target.value })}
                                            placeholder="ex: ING-TEST"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Libellé</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                                            value={formData.libelle || ''}
                                            onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                                            placeholder="ex: Ingénieur de Test"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                                        <select
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all appearance-none"
                                            value={formData.categorie || ''}
                                            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            <option value="Technique">Technique</option>
                                            <option value="Ingénierie">Ingénierie</option>
                                            <option value="Qualité">Qualité</option>
                                            <option value="Management">Management</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profil / Role Associé</label>
                                        <select
                                            required
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all appearance-none"
                                            value={formData.role_id || ''}
                                            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                                        >
                                            <option value="">Sélectionner un rôle</option>
                                            {roles.map(r => (
                                                <option key={r.id_role} value={r.id_role}>{r.nom_role}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Observations</label>
                                <textarea
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Détails complémentaires..."
                                />
                            </div>

                            <div className="col-span-2 flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                                <p className="text-[11px] font-bold text-blue-700 leading-snug">
                                    Cet élément sera immédiatement actif et utilisable dans l'ensemble de l'écosystème de tests industriels après validation.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 mt-10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3.5 text-slate-400 hover:text-slate-600 bg-transparent hover:bg-slate-100 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Valider
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SystemSettingsModal;
