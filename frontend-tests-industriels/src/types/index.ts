// ============================================================================
// TYPES POUR LE SYSTÈME DE GESTION DES TESTS INDUSTRIELS
// ============================================================================

// ----------------------------------------------------------------------------
// User & Authentication
// ----------------------------------------------------------------------------
export interface User {
    id: string;
    id_personnel?: string;
    matricule: string;
    nom: string;
    prenom: string;
    nom_complet?: string;
    name?: string;
    email: string;
    telephone?: string;
    fonction: string;
    service?: string;
    niveauQualification?: 'BTS/DUT' | 'Licence' | 'Ingénieur' | 'Master' | 'Doctorat' | 'Expert';
    dateEmbauche?: string;
    habilitations?: string[];
    langues?: string;
    statut?: 'Actif' | 'Inactif' | 'Externe' | 'Retraité';
    createdAt?: string;
    updatedAt?: string;
    personnel?: PersonnelData;
}

export interface PersonnelData {
    id_personnel: string;
    matricule: string;
    cin: string;
    nom: string;
    prenom: string;
    nom_complet?: string;
    email: string;
    poste?: string;
    role?: RoleData;
}

export interface RoleData {
    id_role: string;
    nom_role: string;
    permissions?: Record<string, string[]>;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

// ----------------------------------------------------------------------------
// Tests Industriels
// ----------------------------------------------------------------------------
export interface TestIndustriel {
    id_test: string;
    numero_test: string;
    type_test_id: string;
    equipement_id: string;
    phase_id?: string;
    procedure_id?: string;
    instrument_id?: string; // Added: instrument principal utilisé pour le test
    date_test: string;
    heure_debut?: string;
    heure_fin?: string;
    heure_debut_planifiee?: string;
    heure_fin_planifiee?: string;
    duree_reelle_heures?: number;
    localisation: string;
    conditions_environnementales?: Record<string, any>;
    niveau_criticite: 1 | 2 | 3 | 4;
    statut_test: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU' | 'ANNULE';
    resultat_global?: 'CONFORME' | 'NON_CONFORME' | 'PARTIEL' | 'NON_APPLICABLE';
    statut_final?: 'OK' | 'NOK'; // Added: statut final simplifié (OK/NOK)
    resultat_final?: 'OK' | 'NOK'; // Liaison Backend
    resultat_attendu?: string; // Added: résultat attendu pour comparaison

    taux_conformite_pct?: number;
    responsable_test_id?: string;
    equipe_test?: string[];
    equipe_members?: PersonnelData[];
    observations_generales?: string;
    observations?: string; // Liaison Backend Clôture
    incidents_signales?: string;
    arret_production_requis?: boolean;
    duree_arret_heures?: number;
    date_cloture?: string; // Liaison Backend Clôture
    created_at: string;
    updated_at?: string;
    created_by?: string;
    // Relations
    type_test?: TypeTest;
    equipement?: Equipement;
    responsable?: User;
    instrument?: InstrumentMesure; // Added: relation vers l'instrument principal
    createur?: User; // Added: utilisateur qui a créé le test
    mesures?: Mesure[]; // Added: relation vers les mesures du test
    est_verrouille?: boolean; // Verrouillage système post-validation
}

export interface TypeTest {
    id_type_test: string;
    code_type: string;
    libelle: string;
    categorie_principale: 'Standard' | 'Obligatoire';
    sous_categorie?: string;
    description?: string;
    niveau_criticite_defaut?: number;
    duree_estimee_jours?: number;
    frequence_recommandee?: string;
    equipements_eligibles?: string[];
    instruments_eligibles?: string[];
    actif: boolean;
    created_at: string;
    checklists_controle?: ChecklistControle[];
}

export interface ChecklistControle {
    id_checklist: string;
    type_test_id: string;
    code_checklist: string;
    titre: string;
    version: string;
    statut: string;
    items?: ItemChecklist[];
}

export interface ItemChecklist {
    id_item: string;
    checklist_id: string;
    numero_item: number;
    libelle: string;
    categorie?: string;
    type_verif: string;
    critere_acceptation?: string;
    valeur_reference?: string;
    tolerance?: string;
    unite_mesure?: string;
    obligatoire: boolean;
    criticite?: number;
}

// ----------------------------------------------------------------------------
// Équipements
// ----------------------------------------------------------------------------
export interface Equipement {
    id_equipement: string;
    code_equipement: string;
    designation: string;
    fabricant?: string;
    modele?: string;
    numero_serie?: string;
    annee_fabrication?: number;
    date_mise_service?: string;
    categorie_equipement: string;
    sous_categorie?: string;
    localisation_site: string;
    localisation_precise?: string;
    puissance_nominale_kw?: number;
    caracteristiques_techniques?: Record<string, any>;
    niveau_criticite?: number;
    statut_operationnel: 'En service' | 'Arrêté' | 'Maintenance' | 'Hors service';
    updated_at?: string;
}

// ----------------------------------------------------------------------------
// Non-Conformités & Corrective Actions
// ----------------------------------------------------------------------------
export interface CauseRacine {
    id_cause: string;
    categorie: string;
    description: string;
    type_cause: string;
    probabilite_recurrence_pct: number;
}

export interface ActionCorrective {
    id_action: string;
    type_action: string;
    description: string;
    responsable_id?: string;
    responsable?: PersonnelData;
    date_prevue: string;
    date_realisee?: string;
    statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINE' | 'TERMINEE' | 'REALISEE' | 'FAITE' | 'ANNULE' | 'A_REVOIR';
    verification_efficacite?: any;
}

export interface PlanAction {
    id_plan: string;
    numero_plan: string;
    responsable_plan_id?: string;
    responsable_id?: string; // Add for consistency with forms
    responsable?: PersonnelData;
    date_creation: string;
    date_echeance: string;
    priorite?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
    objectifs?: string;
    statut_plan: 'VALIDE' | 'ACTIF' | 'TERMINE' | 'ANNULE';
    actions?: ActionCorrective[];
}

export interface NonConformite {
    id_non_conformite: string;
    numero_nc: string;
    test_id?: string;
    mesure_id?: string;
    equipement_id?: string;
    date_detection: string;
    detecteur_id?: string;
    criticite_id?: string;
    type_nc?: string;
    description: string;
    impact_potentiel?: string;
    statut: 'OUVERTE' | 'EN_COURS' | 'CLOTUREE' | 'ANNULEE';
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;

    // Optional relation data
    equipement?: Equipement;
    test?: any;
    criticite?: {
        id_niveau_criticite: string;
        code_niveau: string;
        libelle: string;
        couleur_indicateur: string;
    };
    date_resolution?: string;
    date_cloture?: string;
    cout_estime?: number;
    cout_reel?: number;
    recurrence?: boolean;
    responsable?: User;

    // Analyses & Actions
    conclusions?: string;
    causes_racines?: CauseRacine[];
    plan_action?: PlanAction;
}

// ----------------------------------------------------------------------------
// KPIs
// ----------------------------------------------------------------------------
export interface KPI {
    id: string;
    codeKpi: string;
    libelleKpi: string;
    description?: string;
    categorieKpi: 'Opérationnel' | 'Qualité' | 'Financier' | 'Sécurité' | 'Environnemental';
    sousCategorie?: string;
    formuleCalcul?: string;
    uniteMesure: string;
    valeurCible?: number;
    seuilAlerteMin?: number;
    seuilAlerteMax?: number;
    frequenceMesure: 'Quotidien' | 'Hebdomadaire' | 'Mensuel' | 'Trimestriel' | 'Annuel';
    responsableKpiId?: string;
    actif: boolean;
}

export interface ValeurKPI {
    id: string;
    kpiId: string;
    periodeDebut: string;
    periodeFin: string;
    valeurMesuree: number;
    valeurCible?: number;
    ecartAbsolu?: number;
    ecartPct?: number;
    statut: 'OK' | 'Alerte' | 'Critique';
    commentaire?: string;
    sourceDonnees?: string;
    dateSaisie: string;
    saisiParId?: string;
    // Relations
    kpi?: KPI;
}

// ----------------------------------------------------------------------------
// Rapports
// ----------------------------------------------------------------------------
export interface RapportTest {
    id: string;
    numeroRapport: string;
    testId?: string;
    typeRapport: 'Conformité' | 'Performance' | 'Fiabilité' | 'Sécurité' | 'Maintenance';
    titreRapport: string;
    version: string;
    statutRapport: 'Brouillon' | 'En relecture' | 'Validé' | 'Diffusé' | 'Archivé';
    dateRedaction: string;
    redacteurId?: string;
    dateRelecture?: string;
    relecteurId?: string;
    dateValidation?: string;
    validateurId?: string;
    dateDiffusion?: string;
    resumeExecutif?: string;
    objectifs?: string;
    perimetre?: string;
    methodologie?: string;
    conclusions: string;
    recommandations?: string;
    fichierRapportUrl?: string;
    classificationDocument?: 'Public' | 'Interne' | 'Confidentiel' | 'Restreint';
    destinataires?: Record<string, any>;
    createdAt: string;
    updatedAt?: string;
}

// ----------------------------------------------------------------------------
// Mesures
// ----------------------------------------------------------------------------
export interface Mesure {
    id: string;
    sessionId?: string;
    testId: string;
    instrumentId?: string;
    typeMesure: string;
    parametreMesure: string;
    valeurMesuree: number;
    uniteMesure: string;
    valeurReference?: number;
    toleranceMin?: number;
    toleranceMax?: number;
    ecartAbsolu?: number;
    ecartPct?: number;
    conforme: boolean;
    incertitudeMesure?: string;
    timestampMesure: string;
    conditionsMesure?: string;
    operateurId?: string;
}

// ----------------------------------------------------------------------------
// Instruments de Mesure
// ----------------------------------------------------------------------------
export interface InstrumentMesure {
    id_instrument: string;
    code_instrument: string;
    designation: string;
    type_instrument: string;
    categorie_mesure: 'Électrique' | 'Mécanique' | 'Thermique' | 'Acoustique' | 'Vibration' | 'CND' | 'Autre';
    fabricant?: string;
    modele?: string;
    numero_serie?: string;
    precision?: string;
    plage_mesure_min?: number;
    plage_mesure_max?: number;
    unite_mesure?: string;
    resolution?: string;
    date_acquisition?: string;
    date_derniere_calibration?: string;
    date_prochaine_calibration: string;
    periodicite_calibration_mois: number;
    statut: 'Opérationnel' | 'En calibration' | 'Hors service' | 'Réforme';
    localisation?: string;
    certificat_calibration_url?: string;
    created_at: string;
    updated_at?: string;
}

// ----------------------------------------------------------------------------
// Planning
// ----------------------------------------------------------------------------
export interface PlanningTest {
    id: string;
    testId?: string;
    datePrevue: string;
    heureDebutPrevue?: string;
    heureFinPrevue?: string;
    dureePrevueHeures?: number;
    statutPlanning: 'Planifié' | 'Confirmé' | 'Reporté' | 'Annulé';
    priorite: 'Basse' | 'Normale' | 'Haute' | 'Critique';
    arretProduction?: boolean;
    dureeArretHeures?: number;
    responsablePlanningId?: string;
    dateReport?: string;
    motifReport?: string;
    createdAt: string;
    updatedAt?: string;
    // Relations
    test?: TestIndustriel;
    responsable?: User;
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

// ----------------------------------------------------------------------------
// Dashboard & Statistics
// ----------------------------------------------------------------------------
export interface DashboardStats {
    totalTests: number;
    testsEnCours: number;
    testsTermines: number;
    ncOuvertes: number;
    ncCritiques: number;
    equipementsActifs: number;
    tauxConformite: number;
    tendance: 'hausse' | 'baisse' | 'stable';
    industrial_evolution?: {
        series: { name: string; type: string; data: number[] }[];
        categories: string[];
    };
    nc_distribution?: {
        series: number[];
    };
}


export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
    }[];
}
