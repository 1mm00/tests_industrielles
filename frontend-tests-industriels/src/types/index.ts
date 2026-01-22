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
    name?: string;
    email: string;
    telephone?: string;
    fonction: string;
    service?: string;
    niveauQualification?: 'BTS/DUT' | 'Licence' | 'Ingénieur' | 'Master' | 'Doctorat' | 'Expert';
    dateEmbauche?: string;
    habilitations?: string[];
    langues?: string;
    statut: 'Actif' | 'Inactif' | 'Externe' | 'Retraité';
    createdAt: string;
    updatedAt?: string;
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
    date_test: string;
    heure_debut?: string;
    heure_fin?: string;
    duree_reelle_heures?: number;
    localisation: string;
    conditions_environnementales?: Record<string, any>;
    niveau_criticite: 1 | 2 | 3 | 4;
    statut_test: 'Planifié' | 'En cours' | 'Terminé' | 'Suspendu' | 'Annulé';
    resultat_global?: 'Conforme' | 'Non conforme' | 'Partiel' | 'Non applicable';
    taux_conformite_pct?: number;
    responsable_test_id?: string;
    equipe_test?: string[];
    observations_generales?: string;
    incidents_signales?: string;
    arret_production_requis?: boolean;
    duree_arret_heures?: number;
    created_at: string;
    updated_at?: string;
    created_by?: string;
    // Relations
    type_test?: TypeTest;
    equipement?: Equipement;
    responsable?: User;
}

export interface TypeTest {
    id: string;
    codeType: string;
    libelle_type: string;
    categoriePrincipale: 'Standard' | 'Obligatoire';
    sousCategorie?: string;
    description?: string;
    niveauCriticiteDefaut?: number;
    dureeEstimeeJours?: number;
    frequenceRecommandee?: string;
    actif: boolean;
    createdAt: string;
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
// Non-Conformités
// ----------------------------------------------------------------------------
export interface NonConformite {
    id: string;
    numeroNc: string;
    testId?: string;
    equipementId?: string;
    dateDetection: string;
    detecteurId?: string;
    sourceDetection: 'Test' | 'Audit' | 'Observation' | 'Inspection' | 'Maintenance';
    niveauNc: 'NC1' | 'NC2' | 'NC3' | 'NC4';
    criticiteId?: number;
    titre: string;
    descriptionDetaillee: string;
    impactSecurite: 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
    impactProduction: 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
    impactQualite?: 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
    impactEnvironnement?: 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
    ecartNorme?: string;
    ecartSpecification?: string;
    delaiTraitementHeures: number;
    dateLimiteTraitement: string;
    responsableTraitementId?: string;
    statutNc: 'Ouvert' | 'En analyse' | 'En traitement' | 'Résolu' | 'Clôturé' | 'Annulé';
    dateResolution?: string;
    dateCloture?: string;
    coutEstime?: number;
    coutReel?: number;
    recurrence?: boolean;
    ncOrigineId?: string;
    createdAt: string;
    updatedAt?: string;
    // Relations
    equipement?: Equipement;
    responsable?: User;
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
    id: string;
    codeInstrument: string;
    designation: string;
    typeInstrument: string;
    categorieMesure: 'Électrique' | 'Mécanique' | 'Thermique' | 'Acoustique' | 'Vibration' | 'CND' | 'Autre';
    fabricant?: string;
    modele?: string;
    numeroSerie?: string;
    precision?: string;
    plageMesureMin?: number;
    plageMesureMax?: number;
    uniteMesure?: string;
    resolution?: string;
    dateAcquisition?: string;
    dateDerniereCalibration?: string;
    dateProchaineCalibration: string;
    periodiciteCalibrationMois: number;
    statut: 'Opérationnel' | 'En calibration' | 'Hors service' | 'Réforme';
    localisation?: string;
    certificatCalibrationUrl?: string;
    createdAt: string;
    updatedAt?: string;
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
