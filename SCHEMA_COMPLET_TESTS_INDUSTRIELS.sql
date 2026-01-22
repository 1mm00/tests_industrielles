-- =====================================================================================
-- SCHÉMA DE BASE DE DONNÉES - GESTION DES TESTS INDUSTRIELS
-- =====================================================================================
-- Version: 1.0
-- SGBD: PostgreSQL 14+
-- Encodage: UTF-8
-- Auteur: Architecture Base de Données Industrielle
-- Date: 13 Janvier 2026
-- =====================================================================================

-- =====================================================================================
-- EXTENSIONS POSTGRESQL
-- =====================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- Génération UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- Cryptographie
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Recherche textuelle
CREATE EXTENSION IF NOT EXISTS "btree_gin";       -- Index GIN

-- =====================================================================================
-- DOMAINE 1: RÉFÉRENTIELS ET CLASSIFICATION
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: normes - Normes et Réglementations
-- ---------------------------------------------------------------------------------
CREATE TABLE normes (
    id_norme UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_norme VARCHAR(50) NOT NULL UNIQUE,
    titre VARCHAR(500) NOT NULL,
    organisme_emission VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    date_publication DATE,
    date_derniere_revision DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Obsolète', 'En révision')),
    url_reference VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_norme_code ON normes(code_norme);
CREATE INDEX idx_norme_organisme ON normes(organisme_emission);
CREATE INDEX idx_norme_categorie ON normes(categorie);
CREATE INDEX idx_norme_statut ON normes(statut);

COMMENT ON TABLE normes IS 'Référentiel des normes internationales et réglementations applicables aux tests industriels';
COMMENT ON COLUMN normes.code_norme IS 'Code officiel de la norme (ex: ISO 9001:2015)';
COMMENT ON COLUMN normes.organisme_emission IS 'Organisme émetteur (ISO, IEC, API, ASME)';

-- ---------------------------------------------------------------------------------
-- Table: types_tests - Types de Tests
-- ---------------------------------------------------------------------------------
CREATE TABLE types_tests (
    id_type_test UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_type VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    categorie_principale VARCHAR(50) NOT NULL CHECK (categorie_principale IN ('Standard', 'Obligatoire')),
    sous_categorie VARCHAR(100),
    description TEXT,
    niveau_criticite_defaut INTEGER CHECK (niveau_criticite_defaut BETWEEN 1 AND 4),
    duree_estimee_jours DECIMAL(5,2),
    frequence_recommandee VARCHAR(50),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_type_test_code ON types_tests(code_type);
CREATE INDEX idx_type_test_categorie ON types_tests(categorie_principale);
CREATE INDEX idx_type_test_actif ON types_tests(actif);

COMMENT ON TABLE types_tests IS 'Classification des types de tests industriels';
COMMENT ON COLUMN types_tests.categorie_principale IS 'Standard (bonnes pratiques) ou Obligatoire (réglementaire)';

-- ---------------------------------------------------------------------------------
-- Table: categories_tests - Catégories de Tests (hiérarchique)
-- ---------------------------------------------------------------------------------
CREATE TABLE categories_tests (
    id_categorie UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_categorie VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    categorie_parent_id UUID REFERENCES categories_tests(id_categorie) ON DELETE SET NULL,
    niveau_hierarchie INTEGER NOT NULL,
    ordre_affichage INTEGER,
    description TEXT
);

CREATE INDEX idx_categorie_parent ON categories_tests(categorie_parent_id);
CREATE INDEX idx_categorie_niveau ON categories_tests(niveau_hierarchie);

COMMENT ON TABLE categories_tests IS 'Hiérarchie des catégories de tests (structure arborescente)';

-- ---------------------------------------------------------------------------------
-- Table: niveaux_criticite - Niveaux de Criticité
-- ---------------------------------------------------------------------------------
CREATE TABLE niveaux_criticite (
    id_niveau INTEGER PRIMARY KEY CHECK (id_niveau BETWEEN 1 AND 4),
    code VARCHAR(10) NOT NULL UNIQUE,
    libelle VARCHAR(100) NOT NULL,
    impact_securite VARCHAR(50) NOT NULL CHECK (impact_securite IN ('Faible', 'Modéré', 'Élevé', 'Critique')),
    impact_production VARCHAR(50) NOT NULL CHECK (impact_production IN ('Faible', 'Modéré', 'Élevé', 'Critique')),
    delai_traitement_heures INTEGER NOT NULL,
    couleur_affichage VARCHAR(20)
);

COMMENT ON TABLE niveaux_criticite IS 'Référentiel des 4 niveaux de criticité (NC1 à NC4)';

-- Insert niveaux criticit é par défaut
INSERT INTO niveaux_criticite (id_niveau, code, libelle, impact_securite, impact_production, delai_traitement_heures, couleur_affichage) VALUES
(1, 'NC1', 'Mineure', 'Faible', 'Faible', 720, '#28a745'),
(2, 'NC2', 'Majeure', 'Modéré', 'Modéré', 360, '#ffc107'),
(3, 'NC3', 'Critique', 'Élevé', 'Élevé', 168, '#fd7e14'),
(4, 'NC4', 'Bloquante', 'Critique', 'Critique', 24, '#dc3545');

-- ---------------------------------------------------------------------------------
-- Table: phases_tests - Phases des Tests
-- ---------------------------------------------------------------------------------
CREATE TABLE phases_tests (
    id_phase UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_phase INTEGER NOT NULL UNIQUE,
    code_phase VARCHAR(20) NOT NULL UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    duree_estimee_jours DECIMAL(5,2)
);

COMMENT ON TABLE phases_tests IS 'Phases du cycle de vie des tests (Phase 1: Réception, Phase 2: Opérationnel, Phase 3: Périodique)';

-- Insert phases par défaut
INSERT INTO phases_tests (numero_phase, code_phase, libelle, description, duree_estimee_jours) VALUES
(1, 'PHASE1', 'Réception et Qualification', 'Tests de conformité réglementaire et performance initiale', 5.5),
(2, 'PHASE2', 'Tests Opérationnels', 'Tests de fiabilité, sécurité et intégration', 20.0),
(3, 'PHASE3', 'Tests Périodiques et Maintenance', 'Maintenance préventive et tests récurrents', NULL);

-- ---------------------------------------------------------------------------------
-- Table: methodologies_test - Méthodologies de Test
-- ---------------------------------------------------------------------------------
CREATE TABLE methodologies_test (
    id_methodologie UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_methodologie VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(200) NOT NULL,
    domaine_application VARCHAR(100) NOT NULL,
    reference_normative VARCHAR(200),
    description_detaillee TEXT,
    procedure_type VARCHAR(100)
);

CREATE INDEX idx_methodo_domaine ON methodologies_test(domaine_application);

COMMENT ON TABLE methodologies_test IS 'Référentiel des méthodologies de test applicables';

-- =====================================================================================
-- DOMAINE 2: PROCESSUS DE TESTS
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: procedures_test - Procédures de Test
-- ---------------------------------------------------------------------------------
CREATE TABLE procedures_test (
    id_procedure UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_procedure VARCHAR(50) NOT NULL UNIQUE,
    titre VARCHAR(300) NOT NULL,
    version VARCHAR(20) NOT NULL,
    type_test_id UUID REFERENCES types_tests(id_type_test) ON DELETE RESTRICT,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('Brouillon', 'Validé', 'Obsolète')),
    date_validation DATE,
    auteur_id UUID,  -- FK vers personnel (définie plus tard)
    validateur_id UUID,  -- FK vers personnel
    description_generale TEXT,
    objectifs TEXT,
    perimetre TEXT,
    prerequis TEXT,
    duree_estimee_heures DECIMAL(6,2),
    niveau_competence_requis VARCHAR(50),
    fichier_procedure_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proc_code ON procedures_test(code_procedure);
CREATE INDEX idx_proc_type ON procedures_test(type_test_id);
CREATE INDEX idx_proc_statut ON procedures_test(statut);

COMMENT ON TABLE procedures_test IS 'Procédures détaillées de réalisation des tests';

-- ---------------------------------------------------------------------------------
-- Table: etapes_procedure - Étapes de Procédure
-- ---------------------------------------------------------------------------------
CREATE TABLE etapes_procedure (
    id_etape UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procedure_id UUID NOT NULL REFERENCES procedures_test(id_procedure) ON DELETE CASCADE,
    numero_etape INTEGER NOT NULL,
    phase_id UUID REFERENCES phases_tests(id_phase) ON DELETE RESTRICT,
    titre_etape VARCHAR(300) NOT NULL,
    description_detaillee TEXT,
    duree_estimee_minutes INTEGER,
    personnel_requis INTEGER,
    competences_requises VARCHAR(200),
    equipements_requis TEXT,
    conditions_realisation TEXT,
    criteres_acceptation TEXT,
    risques_associes TEXT,
    mesures_securite TEXT,
    UNIQUE(procedure_id, numero_etape)
);

CREATE INDEX idx_etape_procedure ON etapes_procedure(procedure_id);
CREATE INDEX idx_etape_phase ON etapes_procedure(phase_id);

COMMENT ON TABLE etapes_procedure IS 'Étapes détaillées d\'une procédure de test';

-- ---------------------------------------------------------------------------------
-- Table: checklists_controle - Checklists de Contrôle
-- ---------------------------------------------------------------------------------
CREATE TABLE checklists_controle (
    id_checklist UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_checklist VARCHAR(50) NOT NULL UNIQUE,
    titre VARCHAR(300) NOT NULL,
    type_test_id UUID REFERENCES types_tests(id_type_test) ON DELETE RESTRICT,
    version VARCHAR(20) NOT NULL,
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('Actif', 'Obsolète')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checklist_type ON checklists_controle(type_test_id);

COMMENT ON TABLE checklists_controle IS 'Listes de contrôle pour validation des tests';

-- ---------------------------------------------------------------------------------
-- Table: items_checklist - Items de Checklist
-- ---------------------------------------------------------------------------------
CREATE TABLE items_checklist (
    id_item UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES checklists_controle(id_checklist) ON DELETE CASCADE,
    numero_item INTEGER NOT NULL,
    libelle VARCHAR(500) NOT NULL,
    categorie VARCHAR(100),
    type_verif VARCHAR(50) NOT NULL CHECK (type_verif IN ('Visuel', 'Mesure', 'Test', 'Documentaire')),
    critere_acceptation TEXT,
    valeur_reference VARCHAR(200),
    tolerance VARCHAR(100),
    obligatoire BOOLEAN DEFAULT TRUE,
    criticite INTEGER CHECK (criticite BETWEEN 1 AND 4),
    UNIQUE(checklist_id, numero_item)
);

CREATE INDEX idx_item_checklist ON items_checklist(checklist_id);

COMMENT ON TABLE items_checklist IS 'Éléments individuels des checklists de contrôle';

-- =====================================================================================
-- DOMAINE 3: ÉQUIPEMENTS ET INSTRUMENTATION
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: organisations - Organisations (pour référence)
-- ---------------------------------------------------------------------------------
CREATE TABLE organisations (
    id_organisation UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raison_sociale VARCHAR(300) NOT NULL,
    type_organisation VARCHAR(100),
    siret VARCHAR(14),
    adresse TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE organisations IS 'Organisations propriétaires d\'équipements';

-- ---------------------------------------------------------------------------------
-- Table: equipements - Équipements Testés
-- ---------------------------------------------------------------------------------
CREATE TABLE equipements (
    id_equipement UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_equipement VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(300) NOT NULL,
    fabricant VARCHAR(200),
    modele VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    annee_fabrication INTEGER CHECK (annee_fabrication >= 1900 AND annee_fabrication <= 2100),
    date_mise_service DATE,
    categorie_equipement VARCHAR(100) NOT NULL,
    sous_categorie VARCHAR(100),
    localisation_site VARCHAR(200) NOT NULL,
    localisation_precise VARCHAR(300),
    puissance_nominale_kw DECIMAL(10,2),
    caracteristiques_techniques JSONB,
    niveau_criticite INTEGER CHECK (niveau_criticite BETWEEN 1 AND 4),
    statut_operationnel VARCHAR(50) NOT NULL CHECK (statut_operationnel IN ('En service', 'Arrêté', 'Maintenance', 'Hors service')),
    proprietaire_id UUID REFERENCES organisations(id_organisation),
    responsable_id UUID,  -- FK vers personnel
    date_dernier_test DATE,
    date_prochain_test DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equip_code ON equipements(code_equipement);
CREATE INDEX idx_equip_localisation ON equipements(localisation_site);
CREATE INDEX idx_equip_statut ON equipements(statut_operationnel);
CREATE INDEX idx_equip_criticite ON equipements(niveau_criticite);
CREATE INDEX idx_equip_categorie ON equipements(categorie_equipement);

COMMENT ON TABLE equipements IS 'Équipements industriels soumis aux tests';
COMMENT ON COLUMN equipements.caracteristiques_techniques IS 'Spécifications techniques en JSON (flexible pour tous types d\'équipements)';

-- ---------------------------------------------------------------------------------
-- Table: instruments_mesure - Instruments de Mesure
-- ---------------------------------------------------------------------------------
CREATE TABLE instruments_mesure (
    id_instrument UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_instrument VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(300) NOT NULL,
    type_instrument VARCHAR(100) NOT NULL,
    categorie_mesure VARCHAR(100) NOT NULL CHECK (categorie_mesure IN ('Électrique', 'Mécanique', 'Thermique', 'Acoustique', 'Vibration', 'CND', 'Autre')),
    fabricant VARCHAR(200),
    modele VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    precision VARCHAR(50),
    plage_mesure_min DECIMAL(15,4),
    plage_mesure_max DECIMAL(15,4),
    unite_mesure VARCHAR(20),
    resolution VARCHAR(50),
    date_acquisition DATE,
    date_derniere_calibration DATE,
    date_prochaine_calibration DATE NOT NULL,
    periodicite_calibration_mois INTEGER NOT NULL,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('Opérationnel', 'En calibration', 'Hors service', 'Réforme')),
    localisation VARCHAR(200),
    certificat_calibration_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_instr_code ON instruments_mesure(code_instrument);
CREATE INDEX idx_instr_type ON instruments_mesure(type_instrument);
CREATE INDEX idx_instr_categorie ON instruments_mesure(categorie_mesure);
CREATE INDEX idx_instr_statut ON instruments_mesure(statut);
CREATE INDEX idx_instr_prochaine_calib ON instruments_mesure(date_prochaine_calibration);

COMMENT ON TABLE instruments_mesure IS 'Instruments de mesure utilisés pour les tests';
COMMENT ON COLUMN instruments_mesure.date_prochaine_calibration IS 'Date critique pour gestion de la métrologie';

-- ---------------------------------------------------------------------------------
-- Table: calibrations_instrument - Historique Calibrations
-- ---------------------------------------------------------------------------------
CREATE TABLE calibrations_instrument (
    id_calibration UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID NOT NULL REFERENCES instruments_mesure(id_instrument) ON DELETE CASCADE,
    numero_certificat VARCHAR(100) NOT NULL UNIQUE,
    date_calibration DATE NOT NULL,
    organisme_calibration_id UUID,  -- FK vers organismes_tiers
    methode_calibration VARCHAR(200),
    norme_reference VARCHAR(100),
    etalon_reference VARCHAR(200),
    incertitude_mesure VARCHAR(100),
    resultat_calibration VARCHAR(50) NOT NULL CHECK (resultat_calibration IN ('Conforme', 'Non conforme', 'Avec réserve')),
    ecarts_mesures JSONB,
    date_prochaine_calibration DATE NOT NULL,
    technicien_id UUID,  -- FK vers personnel
    observations TEXT,
    certificat_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calib_instrument ON calibrations_instrument(instrument_id);
CREATE INDEX idx_calib_date ON calibrations_instrument(date_calibration DESC);

COMMENT ON TABLE calibrations_instrument IS 'Historique des calibrations/étalonnages des instruments de mesure';

-- ---------------------------------------------------------------------------------
-- Table: equipements_composants - Composants d'Équipements
-- ---------------------------------------------------------------------------------
CREATE TABLE equipements_composants (
    id_composant UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipement_id UUID NOT NULL REFERENCES equipements(id_equipement) ON DELETE CASCADE,
    code_composant VARCHAR(50) NOT NULL,
    designation VARCHAR(300) NOT NULL,
    type_composant VARCHAR(100) NOT NULL,
    fabricant VARCHAR(200),
    reference_fabricant VARCHAR(100),
    date_installation DATE,
    duree_vie_prevue_heures INTEGER,
    niveau_criticite INTEGER CHECK (niveau_criticite BETWEEN 1 AND 4),
    statut VARCHAR(50) CHECK (statut IN ('Opérationnel', 'Usé', 'À remplacer', 'Remplacé')),
    UNIQUE(equipement_id, code_composant)
);

CREATE INDEX idx_comp_equipement ON equipements_composants(equipement_id);
CREATE INDEX idx_comp_statut ON equipements_composants(statut);

COMMENT ON TABLE equipements_composants IS 'Composants et sous-ensembles des équipements';

-- =====================================================================================
-- DOMAINE 4: RESSOURCES HUMAINES ET ORGANISMES
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: personnel - Personnel
-- ---------------------------------------------------------------------------------
CREATE TABLE personnel (
    id_personnel UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE,
    telephone VARCHAR(20),
    fonction VARCHAR(100) NOT NULL,
    service VARCHAR(100),
    niveau_qualification VARCHAR(50) CHECK (niveau_qualification IN ('BTS/DUT', 'Licence', 'Ingénieur', 'Master', 'Doctorat', 'Expert')),
    date_embauche DATE,
    habilitations TEXT[],
    langues VARCHAR(200),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('Actif', 'Inactif', 'Externe', 'Retraité')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pers_matricule ON personnel(matricule);
CREATE INDEX idx_pers_nom ON personnel(nom, prenom);
CREATE INDEX idx_pers_fonction ON personnel(fonction);
CREATE INDEX idx_pers_statut ON personnel(statut);
CREATE INDEX idx_pers_email ON personnel(email);

COMMENT ON TABLE personnel IS 'Personnel intervenant dans les tests industriels';
COMMENT ON COLUMN personnel.habilitations IS 'Liste des habilitations (électrique, ATEX, etc.)';

-- Maintenant on peut ajouter les FK manquantes
ALTER TABLE procedures_test 
    ADD CONSTRAINT fk_proc_auteur FOREIGN KEY (auteur_id) REFERENCES personnel(id_personnel),
    ADD CONSTRAINT fk_proc_validateur FOREIGN KEY (validateur_id) REFERENCES personnel(id_personnel);

ALTER TABLE equipements
    ADD CONSTRAINT fk_equip_responsable FOREIGN KEY (responsable_id) REFERENCES personnel(id_personnel);

ALTER TABLE calibrations_instrument
    ADD CONSTRAINT fk_calib_technicien FOREIGN KEY (technicien_id) REFERENCES personnel(id_personnel);

-- ---------------------------------------------------------------------------------
-- Table: competences - Référentiel Compétences
-- ---------------------------------------------------------------------------------
CREATE TABLE competences (
    id_competence UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_competence VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    domaine VARCHAR(100) NOT NULL,
    niveau_requis VARCHAR(50) CHECK (niveau_requis IN ('Basique', 'Confirmé', 'Expert')),
    description TEXT
);

CREATE INDEX idx_comp_code ON competences(code_competence);
CREATE INDEX idx_comp_domaine ON competences(domaine);

COMMENT ON TABLE competences IS 'Référentiel des compétences métier requises';

-- ---------------------------------------------------------------------------------
-- Table: personnel_competences - Compétences du Personnel
-- ---------------------------------------------------------------------------------
CREATE TABLE personnel_competences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personnel_id UUID NOT NULL REFERENCES personnel(id_personnel) ON DELETE CASCADE,
    competence_id UUID NOT NULL REFERENCES competences(id_competence) ON DELETE RESTRICT,
    niveau_maitrise VARCHAR(50) NOT NULL CHECK (niveau_maitrise IN ('Basique', 'Confirmé', 'Expert')),
    date_acquisition DATE,
    date_derniere_evaluation DATE,
    date_prochaine_evaluation DATE,
    evaluateur_id UUID REFERENCES personnel(id_personnel),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('Actif', 'Expiré', 'En cours de renouvellement')),
    UNIQUE(personnel_id, competence_id)
);

CREATE INDEX idx_pers_comp_personnel ON personnel_competences(personnel_id);
CREATE INDEX idx_pers_comp_competence ON personnel_competences(competence_id);
CREATE INDEX idx_pers_comp_statut ON personnel_competences(statut);

COMMENT ON TABLE personnel_competences IS 'Association personnel-compétences avec niveau de maîtrise';

-- ---------------------------------------------------------------------------------
-- Table: organismes_tiers - Organismes Tiers
-- ---------------------------------------------------------------------------------
CREATE TABLE organismes_tiers (
    id_organisme UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raison_sociale VARCHAR(300) NOT NULL,
    type_organisme VARCHAR(100) NOT NULL CHECK (type_organisme IN ('Laboratoire', 'Certificateur', 'Inspecteur', 'Bureau d''études', 'Fournisseur')),
    numero_accreditation VARCHAR(100),
    organisme_accreditateur VARCHAR(100),
    domaines_competence TEXT[],
    adresse TEXT,
    email VARCHAR(200),
    telephone VARCHAR(20),
    site_web VARCHAR(200),
    contact_principal VARCHAR(200),
    date_debut_collaboration DATE,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('Actif', 'Inactif', 'Suspendu')),
    evaluations_qualite JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_raison ON organismes_tiers(raison_sociale);
CREATE INDEX idx_org_type ON organismes_tiers(type_organisme);
CREATE INDEX idx_org_statut ON organismes_tiers(statut);

COMMENT ON TABLE organismes_tiers IS 'Laboratoires accrédités, certificateurs, inspecteurs et autres organismes tiers';
COMMENT ON COLUMN organismes_tiers.numero_accreditation IS 'Numéro d\'accréditation COFRAC, ILAC, etc.';

-- Ajout FK manquante pour calibrations
ALTER TABLE calibrations_instrument
    ADD CONSTRAINT fk_calib_organisme FOREIGN KEY (organisme_calibration_id) REFERENCES organismes_tiers(id_organisme);

-- ---------------------------------------------------------------------------------
-- Table: certifications - Certifications du Personnel
-- ---------------------------------------------------------------------------------
CREATE TABLE certifications (
    id_certification UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personnel_id UUID NOT NULL REFERENCES personnel(id_personnel) ON DELETE CASCADE,
    type_certification VARCHAR(100) NOT NULL,
    organisme_certificateur_id UUID REFERENCES organismes_tiers(id_organisme),
    numero_certification VARCHAR(100) UNIQUE,
    date_obtention DATE NOT NULL,
    date_expiration DATE,
    niveau VARCHAR(50),
    domaine VARCHAR(100),
    certificat_url VARCHAR(500),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('Valide', 'Expiré', 'Suspendu', 'Révoqué'))
);

CREATE INDEX idx_cert_personnel ON certifications(personnel_id);
CREATE INDEX idx_cert_statut ON certifications(statut);
CREATE INDEX idx_cert_expiration ON certifications(date_expiration);

COMMENT ON TABLE certifications IS 'Certifications et habilitations du personnel';

-- ---------------------------------------------------------------------------------
-- Table: roles_responsabilites - Rôles et Responsabilités
-- ---------------------------------------------------------------------------------
CREATE TABLE roles_responsabilites (
    id_role UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_role VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    niveau_hierarchique INTEGER,
    responsabilites TEXT
);

COMMENT ON TABLE roles_responsabilites IS 'Référentiel des rôles dans les processus de tests';

-- *Suite dans le fichier suivant...*
-- =====================================================================================
-- SCHÉMA SQL - PARTIE 2 (Domaines 5-9)
-- =====================================================================================

-- =====================================================================================
-- DOMAINE 5: EXÉCUTION ET RÉSULTATS DES TESTS
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: tests_industriels - Tests Industriels (Master)
-- ---------------------------------------------------------------------------------
CREATE TABLE tests_industriels (
    id_test UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_test VARCHAR(50) NOT NULL UNIQUE,
    type_test_id UUID NOT NULL REFERENCES types_tests(id_type_test) ON DELETE RESTRICT,
    equipement_id UUID NOT NULL REFERENCES equipements(id_equipement) ON DELETE RESTRICT,
    phase_id UUID REFERENCES phases_tests(id_phase) ON DELETE RESTRICT,
    procedure_id UUID REFERENCES procedures_test(id_procedure) ON DELETE SET NULL,
    date_test DATE NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    duree_reelle_heures DECIMAL(6,2),
    localisation VARCHAR(300) NOT NULL,
    conditions_environnementales JSONB,
    niveau_criticite INTEGER NOT NULL CHECK (niveau_criticite BETWEEN 1 AND 4),
    statut_test VARCHAR(50) NOT NULL CHECK (statut_test IN ('Planifié', 'En cours', 'Terminé', 'Suspendu', 'Annulé')),
    resultat_global VARCHAR(50) CHECK (resultat_global IN ('Conforme', 'Non conforme', 'Partiel', 'Non applicable')),
    taux_conformite_pct DECIMAL(5,2) CHECK (taux_conformite_pct BETWEEN 0 AND 100),
    responsable_test_id UUID REFERENCES personnel(id_personnel),
    equipe_test UUID[],
    observations_generales TEXT,
    incidents_signales TEXT,
    arret_production_requis BOOLEAN DEFAULT FALSE,
    duree_arret_heures DECIMAL(6,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES personnel(id_personnel)
);

CREATE INDEX idx_test_numero ON tests_industriels(numero_test);
CREATE INDEX idx_test_equipement ON tests_industriels(equipement_id);
CREATE INDEX idx_test_date ON tests_industriels(date_test DESC);
CREATE INDEX idx_test_statut ON tests_industriels(statut_test);
CREATE INDEX idx_test_resultat ON tests_industriels(resultat_global);
CREATE INDEX idx_test_type ON tests_industriels(type_test_id);

COMMENT ON TABLE tests_industriels IS 'Table centrale des tests industriels planifiés et réalisés';
COMMENT ON COLUMN tests_industriels.numero_test IS 'Numéro unique au format TEST-YYYY-NNN';
COMMENT ON COLUMN tests_industriels.conditions_environnementales IS 'Conditions (température, humidité, pression) au format JSON';

-- ---------------------------------------------------------------------------------
-- Table: sessions_test - Sessions de Test
-- ---------------------------------------------------------------------------------
CREATE TABLE sessions_test (
    id_session UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests_industriels(id_test) ON DELETE CASCADE,
    numero_session INTEGER NOT NULL,
    etape_procedure_id UUID REFERENCES etapes_procedure(id_etape),
    date_session TIMESTAMP NOT NULL,
    duree_minutes INTEGER,
    operateur_id UUID REFERENCES personnel(id_personnel),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('En cours', 'Terminé', 'Interrompu', 'Annulé')),
    resultat_session VARCHAR(50) CHECK (resultat_session IN ('Conforme', 'Non conforme', 'Partiel')),
    observations TEXT,
    UNIQUE(test_id, numero_session)
);

CREATE INDEX idx_session_test ON sessions_test(test_id);
CREATE INDEX idx_session_date ON sessions_test(date_session DESC);
CREATE INDEX idx_session_operateur ON sessions_test(operateur_id);

COMMENT ON TABLE sessions_test IS 'Sessions individuelles au sein d\'un test (décomposition temporelle)';

-- ---------------------------------------------------------------------------------
-- Table: mesures - Mesures
-- ---------------------------------------------------------------------------------
CREATE TABLE mesures (
    id_mesure UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions_test(id_session) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests_industriels(id_test) ON DELETE CASCADE,
    instrument_id UUID REFERENCES instruments_mesure(id_instrument),
    type_mesure VARCHAR(100) NOT NULL,
    parametre_mesure VARCHAR(200) NOT NULL,
    valeur_mesuree DECIMAL(15,4) NOT NULL,
    unite_mesure VARCHAR(20) NOT NULL,
    valeur_reference DECIMAL(15,4),
    tolerance_min DECIMAL(15,4),
    tolerance_max DECIMAL(15,4),
    ecart_absolu DECIMAL(15,4),
    ecart_pct DECIMAL(5,2),
    conforme BOOLEAN NOT NULL,
    incertitude_mesure VARCHAR(100),
    timestamp_mesure TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    conditions_mesure TEXT,
    operateur_id UUID REFERENCES personnel(id_personnel)
);

CREATE INDEX idx_mesure_test ON mesures(test_id);
CREATE INDEX idx_mesure_session ON mesures(session_id);
CREATE INDEX idx_mesure_timestamp ON mesures(timestamp_mesure DESC);
CREATE INDEX idx_mesure_conforme ON mesures(conforme);
CREATE INDEX idx_mesure_instrument ON mesures(instrument_id);

COMMENT ON TABLE mesures IS 'Mesures effectuées pendant les tests avec traçabilité complète';
COMMENT ON COLUMN mesures.conforme IS 'Résultat de la comparaison valeur mesurée vs tolérances';

-- ---------------------------------------------------------------------------------
-- Table: resultats_test - Résultats de Test
-- ---------------------------------------------------------------------------------
CREATE TABLE resultats_test (
    id_resultat UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests_industriels(id_test) ON DELETE CASCADE,
    parametre_teste VARCHAR(200) NOT NULL,
    valeur_obtenue VARCHAR(500) NOT NULL,
    valeur_attendue VARCHAR(500),
    unite VARCHAR(50),
    critere_acceptation TEXT,
    resultat VARCHAR(50) NOT NULL CHECK (resultat IN ('Conforme', 'Non conforme', 'Partiel', 'Non applicable')),
    ecart VARCHAR(200),
    analyse_resultat TEXT,
    recommendation TEXT
);

CREATE INDEX idx_result_test ON resultats_test(test_id);
CREATE INDEX idx_result_resultat ON resultats_test(resultat);

COMMENT ON TABLE resultats_test IS 'Résultats consolidés par test';

-- ---------------------------------------------------------------------------------
-- Table: observations_test - Observations de Test
-- ---------------------------------------------------------------------------------
CREATE TABLE observations_test (
    id_observation UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests_industriels(id_test) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions_test(id_session) ON DELETE SET NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type_observation VARCHAR(50) NOT NULL CHECK (type_observation IN ('Normale', 'Anomalie', 'Incident', 'Remarque')),
    severite VARCHAR(50) CHECK (severite IN ('Info', 'Attention', 'Critique')),
    description TEXT NOT NULL,
    observateur_id UUID REFERENCES personnel(id_personnel),
    action_immediate TEXT,
    suivi_requis BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_obs_test ON observations_test(test_id);
CREATE INDEX idx_obs_timestamp ON observations_test(timestamp DESC);
CREATE INDEX idx_obs_type ON observations_test(type_observation);
CREATE INDEX idx_obs_suivi ON observations_test(suivi_requis);

COMMENT ON TABLE observations_test IS 'Observations et remarques pendant l\'exécution des tests';

-- =====================================================================================
-- DOMAINE 6: CONFORMITÉ ET NON-CONFORMITÉS
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: non_conformites - Non-Conformités
-- ---------------------------------------------------------------------------------
CREATE TABLE non_conformites (
    id_nc UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_nc VARCHAR(50) NOT NULL UNIQUE,
    test_id UUID REFERENCES tests_industriels(id_test) ON DELETE SET NULL,
    equipement_id UUID REFERENCES equipements(id_equipement) ON DELETE RESTRICT,
    date_detection TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detecteur_id UUID REFERENCES personnel(id_personnel),
    source_detection VARCHAR(100) NOT NULL CHECK (source_detection IN ('Test', 'Audit', 'Observation', 'Inspection', 'Maintenance')),
    niveau_nc VARCHAR(10) NOT NULL CHECK (niveau_nc IN ('NC1', 'NC2', 'NC3', 'NC4')),
    criticite_id INTEGER REFERENCES niveaux_criticite(id_niveau),
    titre VARCHAR(300) NOT NULL,
    description_detaillee TEXT NOT NULL,
    impact_securite VARCHAR(50) NOT NULL CHECK (impact_securite IN ('Faible', 'Modéré', 'Élevé', 'Critique')),
    impact_production VARCHAR(50) NOT NULL CHECK (impact_production IN ('Faible', 'Modéré', 'Élevé', 'Critique')),
    impact_qualite VARCHAR(50) CHECK (impact_qualite IN ('Faible', 'Modéré', 'Élevé', 'Critique')),
    impact_environnement VARCHAR(50) CHECK (impact_environnement IN ('Faible', 'Modéré', 'Élevé', 'Critique')),
    ecart_norme VARCHAR(200),
    ecart_specification TEXT,
    delai_traitement_heures INTEGER NOT NULL,
    date_limite_traitement TIMESTAMP NOT NULL,
    responsable_traitement_id UUID REFERENCES personnel(id_personnel),
    statut_nc VARCHAR(50) NOT NULL CHECK (statut_nc IN ('Ouvert', 'En analyse', 'En traitement', 'Résolu', 'Clôturé', 'Annulé')),
    date_resolution TIMESTAMP,
    date_cloture TIMESTAMP,
    cout_estime DECIMAL(12,2),
    cout_reel DECIMAL(12,2),
    recurrence BOOLEAN DEFAULT FALSE,
    nc_origine_id UUID REFERENCES non_conformites(id_nc),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nc_numero ON non_conformites(numero_nc);
CREATE INDEX idx_nc_equipement ON non_conformites(equipement_id);
CREATE INDEX idx_nc_statut ON non_conformites(statut_nc);
CREATE INDEX idx_nc_niveau ON non_conformites(niveau_nc);
CREATE INDEX idx_nc_date ON non_conformites(date_detection DESC);
CREATE INDEX idx_nc_responsable ON non_conformites(responsable_traitement_id);

COMMENT ON TABLE non_conformites IS 'Enregistrement des non-conformités détectées lors des tests ou audits';
COMMENT ON COLUMN non_conformites.numero_nc IS 'Numéro unique au format NC-YYYY-NNN';
COMMENT ON COLUMN non_conformites.recurrence IS 'Indique si c\'est une NC récurrente';

-- ---------------------------------------------------------------------------------
-- Table: causes_racines - Causes Racines
-- ---------------------------------------------------------------------------------
CREATE TABLE causes_racines (
    id_cause UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nc_id UUID NOT NULL REFERENCES non_conformites(id_nc) ON DELETE CASCADE,
    type_cause VARCHAR(100) NOT NULL CHECK (type_cause IN ('Humain', 'Matériel', 'Méthode', 'Milieu', 'Management', 'Mesure')),
    categorie_cause VARCHAR(100),
    description_cause TEXT NOT NULL,
    methode_analyse VARCHAR(100) CHECK (methode_analyse IN ('5 Pourquoi', 'Ishikawa', 'AMDEC', 'Pareto', 'Arbre des défaillances')),
    niveau_cause VARCHAR(50) NOT NULL CHECK (niveau_cause IN ('Cause immédiate', 'Cause contributive', 'Cause racine')),
    contributeur_analyse_id UUID REFERENCES personnel(id_personnel),
    date_analyse DATE NOT NULL,
    preuve_analyse TEXT,
    validation_analyse BOOLEAN DEFAULT FALSE,
    validateur_id UUID REFERENCES personnel(id_personnel)
);

CREATE INDEX idx_cause_nc ON causes_racines(nc_id);
CREATE INDEX idx_cause_type ON causes_racines(type_cause);
CREATE INDEX idx_cause_niveau ON causes_racines(niveau_cause);

COMMENT ON TABLE causes_racines IS 'Analyse des causes racines des non-conformités (méthode des 5M)';

-- ---------------------------------------------------------------------------------
-- Table: actions_correctives - Actions Correctives
-- ---------------------------------------------------------------------------------
CREATE TABLE actions_correctives (
    id_action UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_action VARCHAR(50) NOT NULL UNIQUE,
    nc_id UUID REFERENCES non_conformites(id_nc) ON DELETE SET NULL,
    cause_racine_id UUID REFERENCES causes_racines(id_cause),
    type_action VARCHAR(50) NOT NULL CHECK (type_action IN ('Corrective', 'Préventive', 'Curative')),
    categorie_action VARCHAR(100) CHECK (categorie_action IN ('Technique', 'Organisationnelle', 'Formation', 'Documentation', 'Équipement')),
    titre_action VARCHAR(300) NOT NULL,
    description_action TEXT NOT NULL,
    objectif_action TEXT,
    responsable_action_id UUID REFERENCES personnel(id_personnel),
    contributeurs UUID[],
    date_creation DATE NOT NULL DEFAULT CURRENT_DATE,
    date_debut_prevue DATE,
    date_fin_prevue DATE NOT NULL,
    date_debut_reelle DATE,
    date_fin_reelle DATE,
    priorite VARCHAR(50) NOT NULL CHECK (priorite IN ('Basse', 'Moyenne', 'Haute', 'Critique')),
    statut_action VARCHAR(50) NOT NULL CHECK (statut_action IN ('Planifiée', 'En cours', 'Terminée', 'Retardée', 'Annulée')),
    budget_estime DECIMAL(12,2),
    cout_reel DECIMAL(12,2),
    ressources_necessaires TEXT,
    indicateur_succes TEXT,
    verification_efficacite TEXT,
    efficacite_validee BOOLEAN DEFAULT FALSE,
    taux_efficacite DECIMAL(5,2) CHECK (taux_efficacite BETWEEN 0 AND 100),
    observations TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_action_numero ON actions_correctives(numero_action);
CREATE INDEX idx_action_nc ON actions_correctives(nc_id);
CREATE INDEX idx_action_statut ON actions_correctives(statut_action);
CREATE INDEX idx_action_responsable ON actions_correctives(responsable_action_id);
CREATE INDEX idx_action_priorite ON actions_correctives(priorite);

COMMENT ON TABLE actions_correctives IS 'Actions correctives et préventives';

-- ---------------------------------------------------------------------------------
-- Table: plans_action - Plans d'Action
-- ---------------------------------------------------------------------------------
CREATE TABLE plans_action (
    id_plan UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nc_id UUID REFERENCES non_conformites(id_nc) ON DELETE CASCADE,
    numero_plan VARCHAR(50) NOT NULL UNIQUE,
    titre_plan VARCHAR(300) NOT NULL,
    date_creation DATE NOT NULL DEFAULT CURRENT_DATE,
    responsable_plan_id UUID REFERENCES personnel(id_personnel),
    objectif_global TEXT NOT NULL,
    date_cible DATE NOT NULL,
    statut_plan VARCHAR(50) NOT NULL CHECK (statut_plan IN ('En cours', 'Terminé', 'Retardé', 'Annulé')),
    taux_avancement_pct DECIMAL(5,2) CHECK (taux_avancement_pct BETWEEN 0 AND 100),
    validation_finale BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_plan_nc ON plans_action(nc_id);
CREATE INDEX idx_plan_statut ON plans_action(statut_plan);

COMMENT ON TABLE plans_action IS 'Plans d\'action structurés pour traiter les non-conformités';

-- ---------------------------------------------------------------------------------
-- Table: etapes_plan_action - Étapes du Plan d'Action
-- ---------------------------------------------------------------------------------
CREATE TABLE etapes_plan_action (
    id_etape UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES plans_action(id_plan) ON DELETE CASCADE,
    action_corrective_id UUID REFERENCES actions_correctives(id_action),
    numero_etape INTEGER NOT NULL,
    titre_etape VARCHAR(300) NOT NULL,
    description TEXT,
    responsable_id UUID REFERENCES personnel(id_personnel),
    date_debut DATE,
    date_fin DATE,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('À faire', 'En cours', 'Terminé', 'Bloqué')),
    commentaires TEXT,
    UNIQUE(plan_id, numero_etape)
);

CREATE INDEX idx_etape_plan ON etapes_plan_action(plan_id);
CREATE INDEX idx_etape_action ON etapes_plan_action(action_corrective_id);

COMMENT ON TABLE etapes_plan_action IS 'Étapes détaillées des plans d\'action';

-- ---------------------------------------------------------------------------------
-- Table: verification_efficacite - Vérification Efficacité
-- ---------------------------------------------------------------------------------
CREATE TABLE verification_efficacite (
    id_verification UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id UUID NOT NULL REFERENCES actions_correctives(id_action) ON DELETE CASCADE,
    date_verification DATE NOT NULL,
    verificateur_id UUID REFERENCES personnel(id_personnel),
    methode_verification TEXT NOT NULL,
    resultats_verification TEXT NOT NULL,
    kpis_mesures JSONB,
    efficacite_constatee VARCHAR(50) NOT NULL CHECK (efficacite_constatee IN ('Efficace', 'Partiellement efficace', 'Inefficace')),
    taux_efficacite_pct DECIMAL(5,2) CHECK (taux_efficacite_pct BETWEEN 0 AND 100),
    actions_complementaires TEXT,
    validation BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_verif_action ON verification_efficacite(action_id);
CREATE INDEX idx_verif_date ON verification_efficacite(date_verification DESC);

COMMENT ON TABLE verification_efficacite IS 'Suivi de l\'efficacité des actions correctives';

-- =====================================================================================
-- DOMAINE 7: REPORTING ET KPIs
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: rapports_test - Rapports de Test
-- ---------------------------------------------------------------------------------
CREATE TABLE rapports_test (
    id_rapport UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_rapport VARCHAR(50) NOT NULL UNIQUE,
    test_id UUID REFERENCES tests_industriels(id_test) ON DELETE SET NULL,
    type_rapport VARCHAR(100) NOT NULL CHECK (type_rapport IN ('Conformité', 'Performance', 'Fiabilité', 'Sécurité', 'Maintenance')),
    titre_rapport VARCHAR(500) NOT NULL,
    version VARCHAR(20) NOT NULL,
    statut_rapport VARCHAR(50) NOT NULL CHECK (statut_rapport IN ('Brouillon', 'En relecture', 'Validé', 'Diffusé', 'Archivé')),
    date_redaction DATE NOT NULL,
    redacteur_id UUID REFERENCES personnel(id_personnel),
    date_relecture DATE,
    relecteur_id UUID REFERENCES personnel(id_personnel),
    date_validation DATE,
    validateur_id UUID REFERENCES personnel(id_personnel),
    date_diffusion DATE,
    resume_executif TEXT,
    objectifs TEXT,
    perimetre TEXT,
    methodologie TEXT,
    conclusions TEXT NOT NULL,
    recommandations TEXT,
    fichier_rapport_url VARCHAR(500),
    fichier_rapport_hash VARCHAR(128),
    signature_electronique TEXT,
    classification_document VARCHAR(50) CHECK (classification_document IN ('Public', 'Interne', 'Confidentiel', 'Restreint')),
    destinataires JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rapp_numero ON rapports_test(numero_rapport);
CREATE INDEX idx_rapp_test ON rapports_test(test_id);
CREATE INDEX idx_rapp_statut ON rapports_test(statut_rapport);
CREATE INDEX idx_rapp_date ON rapports_test(date_redaction DESC);
CREATE INDEX idx_rapp_type ON rapports_test(type_rapport);

COMMENT ON TABLE rapports_test IS 'Rapports générés suite aux tests';
COMMENT ON COLUMN rapports_test.fichier_rapport_hash IS 'Empreinte SHA-256 pour intégrité du fichier';

-- ---------------------------------------------------------------------------------
-- Table: sections_rapport - Sections de Rapport
-- ---------------------------------------------------------------------------------
CREATE TABLE sections_rapport (
    id_section UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rapport_id UUID NOT NULL REFERENCES rapports_test(id_rapport) ON DELETE CASCADE,
    numero_section VARCHAR(20) NOT NULL,
    titre_section VARCHAR(300) NOT NULL,
    contenu TEXT,
    ordre_affichage INTEGER NOT NULL,
    UNIQUE(rapport_id, numero_section)
);

CREATE INDEX idx_section_rapport ON sections_rapport(rapport_id);

COMMENT ON TABLE sections_rapport IS 'Sections structurées des rapports de test';

-- ---------------------------------------------------------------------------------
-- Table: annexes_rapport - Annexes des Rapports
-- ---------------------------------------------------------------------------------
CREATE TABLE annexes_rapport (
    id_annexe UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rapport_id UUID NOT NULL REFERENCES rapports_test(id_rapport) ON DELETE CASCADE,
    numero_annexe VARCHAR(20) NOT NULL,
    titre_annexe VARCHAR(300) NOT NULL,
    type_annexe VARCHAR(100) NOT NULL CHECK (type_annexe IN ('Données brutes', 'Calculs', 'Photos', 'Schémas', 'Certificats', 'Autre')),
    description TEXT,
    fichier_url VARCHAR(500),
    fichier_type VARCHAR(50),
    taille_fichier_kb INTEGER,
    UNIQUE(rapport_id, numero_annexe)
);

CREATE INDEX idx_annexe_rapport ON annexes_rapport(rapport_id);

COMMENT ON TABLE annexes_rapport IS 'Annexes et pièces jointes des rapports';

-- ---------------------------------------------------------------------------------
-- Table: kpis - Indicateurs de Performance
-- ---------------------------------------------------------------------------------
CREATE TABLE kpis (
    id_kpi UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_kpi VARCHAR(50) NOT NULL UNIQUE,
    libelle_kpi VARCHAR(300) NOT NULL,
    description TEXT,
    categorie_kpi VARCHAR(100) NOT NULL CHECK (categorie_kpi IN ('Opérationnel', 'Qualité', 'Financier', 'Sécurité', 'Environnemental')),
    sous_categorie VARCHAR(100),
    formule_calcul TEXT,
    unite_mesure VARCHAR(50) NOT NULL,
    valeur_cible DECIMAL(15,4),
    seuil_alerte_min DECIMAL(15,4),
    seuil_alerte_max DECIMAL(15,4),
    frequence_mesure VARCHAR(50) NOT NULL CHECK (frequence_mesure IN ('Quotidien', 'Hebdomadaire', 'Mensuel', 'Trimestriel', 'Annuel')),
    responsable_kpi_id UUID REFERENCES personnel(id_personnel),
    actif BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_kpi_code ON kpis(code_kpi);
CREATE INDEX idx_kpi_categorie ON kpis(categorie_kpi);
CREATE INDEX idx_kpi_actif ON kpis(actif);

COMMENT ON TABLE kpis IS 'Référentiel des indicateurs de performance';

-- ---------------------------------------------------------------------------------
-- Table: valeurs_kpi - Valeurs des KPIs
-- ---------------------------------------------------------------------------------
CREATE TABLE valeurs_kpi (
    id_valeur UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID NOT NULL REFERENCES kpis(id_kpi) ON DELETE CASCADE,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    valeur_mesuree DECIMAL(15,4) NOT NULL,
    valeur_cible DECIMAL(15,4),
    ecart_absolu DECIMAL(15,4),
    ecart_pct DECIMAL(5,2),
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('OK', 'Alerte', 'Critique')),
    commentaire TEXT,
    source_donnees VARCHAR(200),
    date_saisie TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    saisi_par_id UUID REFERENCES personnel(id_personnel),
    UNIQUE(kpi_id, periode_debut, periode_fin)
);

CREATE INDEX idx_kpi_valeur_kpi ON valeurs_kpi(kpi_id);
CREATE INDEX idx_kpi_valeur_periode ON valeurs_kpi(periode_debut DESC);
CREATE INDEX idx_kpi_valeur_statut ON valeurs_kpi(statut);

COMMENT ON TABLE valeurs_kpi IS 'Valeurs mesurées des KPIs dans le temps';

-- ---------------------------------------------------------------------------------
-- Table: documents - Documents Généraux
-- ---------------------------------------------------------------------------------
CREATE TABLE documents (
    id_document UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_document VARCHAR(50) NOT NULL UNIQUE,
    titre VARCHAR(500) NOT NULL,
    type_document VARCHAR(100) NOT NULL CHECK (type_document IN ('Procédure', 'Certificat', 'Plan', 'Rapport', 'Notice', 'Spécification', 'Autre')),
    categorie VARCHAR(100) CHECK (categorie IN ('Technique', 'Administratif', 'Qualité', 'Sécurité', 'Réglementaire')),
    version VARCHAR(20) NOT NULL,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('Brouillon', 'En révision', 'Validé', 'Obsolète')),
    date_creation DATE NOT NULL,
    auteur_id UUID REFERENCES personnel(id_personnel),
    date_validation DATE,
    validateur_id UUID REFERENCES personnel(id_personnel),
    date_obsolescence DATE,
    fichier_url VARCHAR(500),
    classification VARCHAR(50) CHECK (classification IN ('Public', 'Interne', 'Confidentiel')),
    mots_cles TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doc_numero ON documents(numero_document);
CREATE INDEX idx_doc_type ON documents(type_document);
CREATE INDEX idx_doc_statut ON documents(statut);
CREATE INDEX idx_doc_mots_cles ON documents USING gin(mots_cles);

COMMENT ON TABLE documents IS 'Gestion documentaire générale';

-- ---------------------------------------------------------------------------------
-- Table: certificats - Certificats
-- ---------------------------------------------------------------------------------
CREATE TABLE certificats (
    id_certificat UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_certificat VARCHAR(100) NOT NULL UNIQUE,
    test_id UUID REFERENCES tests_industriels(id_test),
    equipement_id UUID REFERENCES equipements(id_equipement),
    type_certificat VARCHAR(100) NOT NULL CHECK (type_certificat IN ('CE', 'ATEX', 'Conformité', 'Qualification', 'Calibration', 'Autre')),
    norme_reference VARCHAR(200) NOT NULL,
    organisme_certificateur_id UUID REFERENCES organismes_tiers(id_organisme),
    date_emission DATE NOT NULL,
    date_validite_debut DATE NOT NULL,
    date_validite_fin DATE,
    statut_certificat VARCHAR(50) NOT NULL CHECK (statut_certificat IN ('Valide', 'Expiré', 'Révoqué', 'Suspendu')),
    fichier_certificat_url VARCHAR(500),
    observations TEXT
);

CREATE INDEX idx_cert_numero ON certificats(numero_certificat);
CREATE INDEX idx_cert_test ON certificats(test_id);
CREATE INDEX idx_cert_equipement ON certificats(equipement_id);
CREATE INDEX idx_cert_statut ON certificats(statut_certificat);
CREATE INDEX idx_cert_validite ON certificats(date_validite_fin);

COMMENT ON TABLE certificats IS 'Certificats de conformité, CE, ATEX, etc.';

-- *Suite dans le fichier suivant...*
-- =====================================================================================
-- SCHÉMA SQL - PARTIE 3 FINALE (Domaines 8-9 + Tables Transversales + Vues + Triggers)
-- =====================================================================================

-- =====================================================================================
-- DOMAINE 8: PLANIFICATION ET CALENDRIER
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: planning_tests - Planning des Tests
-- ---------------------------------------------------------------------------------
CREATE TABLE planning_tests (
    id_planning UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES tests_industriels(id_test) ON DELETE CASCADE,
    date_prevue DATE NOT NULL,
    heure_debut_prevue TIME,
    heure_fin_prevue TIME,
    duree_prevue_heures DECIMAL(6,2),
    statut_planning VARCHAR(50) NOT NULL CHECK (statut_planning IN ('Planifié', 'Confirmé', 'Reporté', 'Annulé')),
    priorite VARCHAR(50) NOT NULL CHECK (priorite IN ('Basse', 'Normale', 'Haute', 'Critique')),
    arret_production BOOLEAN DEFAULT FALSE,
    duree_arret_heures DECIMAL(6,2),
    responsable_planning_id UUID REFERENCES personnel(id_personnel),
    date_report DATE,
    motif_report TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_planning_test ON planning_tests(test_id);
CREATE INDEX idx_planning_date ON planning_tests(date_prevue);
CREATE INDEX idx_planning_statut ON planning_tests(statut_planning);
CREATE INDEX idx_planning_priorite ON planning_tests(priorite);

COMMENT ON TABLE planning_tests IS 'Planification globale des tests';

-- ---------------------------------------------------------------------------------
-- Table: calendrier_obligatoire - Calendrier Tests Obligatoires
-- ---------------------------------------------------------------------------------
CREATE TABLE calendrier_obligatoire (
    id_calendrier UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipement_id UUID NOT NULL REFERENCES equipements(id_equipement) ON DELETE CASCADE,
    type_test_id UUID NOT NULL REFERENCES types_tests(id_type_test) ON DELETE RESTRICT,
    frequence_reglementaire VARCHAR(50) NOT NULL CHECK (frequence_reglementaire IN ('Quotidien', 'Hebdomadaire', 'Mensuel', 'Trimestriel', 'Semestriel', 'Annuel')),
    mois_realisation INTEGER CHECK (mois_realisation BETWEEN 1 AND 12),
    jour_realisation INTEGER CHECK (jour_realisation BETWEEN 1 AND 31),
    delai_alerte_jours INTEGER DEFAULT 30,
    derniere_realisation DATE,
    prochaine_echeance DATE NOT NULL,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('À planifier', 'Planifié', 'Réalisé', 'En retard')),
    actif BOOLEAN DEFAULT TRUE,
    UNIQUE(equipement_id, type_test_id)
);

CREATE INDEX idx_cal_equipement ON calendrier_obligatoire(equipement_id);
CREATE INDEX idx_cal_type ON calendrier_obligatoire(type_test_id);
CREATE INDEX idx_cal_echeance ON calendrier_obligatoire(prochaine_echeance);
CREATE INDEX idx_cal_statut ON calendrier_obligatoire(statut);

COMMENT ON TABLE calendrier_obligatoire IS 'Calendrier des tests obligatoires réglementaires';

-- ---------------------------------------------------------------------------------
-- Table: allocation_ressources - Allocation des Ressources
-- ---------------------------------------------------------------------------------
CREATE TABLE allocation_ressources (
    id_allocation UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planning_id UUID REFERENCES planning_tests(id_planning) ON DELETE CASCADE,
    type_ressource VARCHAR(50) NOT NULL CHECK (type_ressource IN ('Personnel', 'Équipement', 'Instrument', 'Salle', 'Autre')),
    ressource_id UUID NOT NULL,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    quantite DECIMAL(10,2),
    unite VARCHAR(50),
    statut_allocation VARCHAR(50) NOT NULL CHECK (statut_allocation IN ('Réservé', 'Confirmé', 'Libéré', 'Annulé')),
    commentaires TEXT,
    CHECK (date_fin >= date_debut)
);

CREATE INDEX idx_alloc_planning ON allocation_ressources(planning_id);
CREATE INDEX idx_alloc_ressource ON allocation_ressources(ressource_id, type_ressource);
CREATE INDEX idx_alloc_dates ON allocation_ressources(date_debut, date_fin);

COMMENT ON TABLE allocation_ressources IS 'Allocation des ressources humaines et matérielles';
COMMENT ON COLUMN allocation_ressources.ressource_id IS 'ID générique pointant vers personnel, équipement, instrument selon type';

-- ---------------------------------------------------------------------------------
-- Table: jalons - Jalons
-- ---------------------------------------------------------------------------------
CREATE TABLE jalons (
    id_jalon UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_jalon VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(300) NOT NULL,
    description TEXT,
    date_cible DATE NOT NULL,
    date_realisee DATE,
    statut_jalon VARCHAR(50) NOT NULL CHECK (statut_jalon IN ('À venir', 'En cours', 'Atteint', 'Retardé', 'Annulé')),
    responsable_id UUID REFERENCES personnel(id_personnel),
    criteres_validation TEXT
);

CREATE INDEX idx_jalon_code ON jalons(code_jalon);
CREATE INDEX idx_jalon_date ON jalons(date_cible);
CREATE INDEX idx_jalon_statut ON jalons(statut_jalon);

COMMENT ON TABLE jalons IS 'Jalons clés des projets de tests';

-- ---------------------------------------------------------------------------------
-- Table: indisponibilites - Indisponibilités Ressources
-- ---------------------------------------------------------------------------------
CREATE TABLE indisponibilites (
    id_indisponibilite UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_ressource VARCHAR(50) NOT NULL CHECK (type_ressource IN ('Personnel', 'Équipement', 'Instrument', 'Salle')),
    ressource_id UUID NOT NULL,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    motif VARCHAR(200) NOT NULL,
    type_indispo VARCHAR(100) NOT NULL CHECK (type_indispo IN ('Congé', 'Formation', 'Maintenance', 'Panne', 'Calibration', 'Autre')),
    impact_planning VARCHAR(50) CHECK (impact_planning IN ('Faible', 'Moyen', 'Élevé')),
    CHECK (date_fin >= date_debut)
);

CREATE INDEX idx_indispo_ressource ON indisponibilites(ressource_id, type_ressource);
CREATE INDEX idx_indispo_dates ON indisponibilites(date_debut, date_fin);

COMMENT ON TABLE indisponibilites IS 'Indisponibilités des ressources (congés, maintenances, pannes)';

-- =====================================================================================
-- DOMAINE 9: TRAÇABILITÉ ET ARCHIVAGE
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: audit_trail - Audit Trail
-- ---------------------------------------------------------------------------------
CREATE TABLE audit_trail (
    id_audit UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp_operation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type_operation VARCHAR(50) NOT NULL CHECK (type_operation IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    table_concernee VARCHAR(100) NOT NULL,
    id_enregistrement UUID NOT NULL,
    utilisateur_id UUID REFERENCES personnel(id_personnel),
    adresse_ip VARCHAR(50),
    poste_travail VARCHAR(100),
    anciennes_valeurs JSONB,
    nouvelles_valeurs JSONB,
    champs_modifies TEXT[],
    justification TEXT,
    validation_requise BOOLEAN DEFAULT FALSE,
    validateur_id UUID REFERENCES personnel(id_personnel),
    date_validation TIMESTAMP
);

CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp_operation DESC);
CREATE INDEX idx_audit_table ON audit_trail(table_concernee);
CREATE INDEX idx_audit_utilisateur ON audit_trail(utilisateur_id);
CREATE INDEX idx_audit_enreg ON audit_trail(table_concernee, id_enregistrement);
CREATE INDEX idx_audit_type_op ON audit_trail(type_operation);

COMMENT ON TABLE audit_trail IS 'Traçabilité complète de toutes les opérations critiques';
COMMENT ON COLUMN audit_trail.anciennes_valeurs IS 'Valeurs avant modification (JSON)';
COMMENT ON COLUMN audit_trail.nouvelles_valeurs IS 'Valeurs après modification (JSON)';

-- ---------------------------------------------------------------------------------
-- Table: versions_documents - Versions de Documents
-- ---------------------------------------------------------------------------------
CREATE TABLE versions_documents (
    id_version UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id_document) ON DELETE CASCADE,
    numero_version VARCHAR(20) NOT NULL,
    date_version TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    auteur_version_id UUID REFERENCES personnel(id_personnel),
    type_modification VARCHAR(100) NOT NULL CHECK (type_modification IN ('Création', 'Révision', 'Correction', 'Mise à jour')),
    description_modifs TEXT,
    fichier_version_url VARCHAR(500),
    fichier_hash VARCHAR(128),
    statut_version VARCHAR(50) NOT NULL CHECK (statut_version IN ('Brouillon', 'Validé', 'Obsolète')),
    validateur_id UUID REFERENCES personnel(id_personnel),
    date_validation DATE,
    UNIQUE(document_id, numero_version)
);

CREATE INDEX idx_vers_document ON versions_documents(document_id);
CREATE INDEX idx_vers_date ON versions_documents(date_version DESC);

COMMENT ON TABLE versions_documents IS 'Historique des versions de documents (versioning complet)';
COMMENT ON COLUMN versions_documents.fichier_hash IS 'Hash SHA-256 pour intégrité';

-- ---------------------------------------------------------------------------------
-- Table: archives - Archives
-- ---------------------------------------------------------------------------------
CREATE TABLE archives (
    id_archive UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_archive VARCHAR(100) NOT NULL CHECK (type_archive IN ('Rapport', 'Certificat', 'NC', 'Test', 'Document', 'Autre')),
    reference_origine VARCHAR(100) NOT NULL,
    id_origine UUID NOT NULL,
    date_archivage TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_expiration_archive DATE,
    duree_conservation_ans INTEGER NOT NULL,
    reference_reglementaire VARCHAR(200),
    emplacement_physique VARCHAR(300),
    emplacement_numerique VARCHAR(500),
    format_archive VARCHAR(50) NOT NULL CHECK (format_archive IN ('PDF/A', 'XML', 'JSON', 'ZIP', 'Autre')),
    taille_archive_mb DECIMAL(10,2),
    checksum_archive VARCHAR(128),
    archiviste_id UUID REFERENCES personnel(id_personnel),
    statut_archive VARCHAR(50) NOT NULL CHECK (statut_archive IN ('Actif', 'Détruit', 'Transféré', 'Expiré')),
    classification VARCHAR(50) NOT NULL CHECK (classification IN ('Public', 'Interne', 'Confidentiel', 'Secret'))
);

CREATE INDEX idx_arch_type ON archives(type_archive);
CREATE INDEX idx_arch_reference ON archives(reference_origine);
CREATE INDEX idx_arch_expiration ON archives(date_expiration_archive);
CREATE INDEX idx_arch_statut ON archives(statut_archive);

COMMENT ON TABLE archives IS 'Gestion des archives documentaires avec conservation réglementaire';
COMMENT ON COLUMN archives.duree_conservation_ans IS 'Durée réglementaire de conservation';

-- ---------------------------------------------------------------------------------
-- Table: historique_tests - Historique des Tests
-- ---------------------------------------------------------------------------------
CREATE TABLE historique_tests (
    id_historique UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipement_id UUID NOT NULL REFERENCES equipements(id_equipement) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests_industriels(id_test) ON DELETE CASCADE,
    date_test DATE NOT NULL,
    type_test VARCHAR(100) NOT NULL,
    resultat_test VARCHAR(50) NOT NULL CHECK (resultat_test IN ('Conforme', 'Non conforme', 'Partiel')),
    responsable_id UUID REFERENCES personnel(id_personnel),
    rapport_id UUID REFERENCES rapports_test(id_rapport),
    observations_cles TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_histo_equipement ON historique_tests(equipement_id);
CREATE INDEX idx_histo_test ON historique_tests(test_id);
CREATE INDEX idx_histo_date ON historique_tests(date_test DESC);

COMMENT ON TABLE historique_tests IS 'Historique complet des tests réalisés sur les équipements';

-- ---------------------------------------------------------------------------------
-- Table: metadonnees - Métadonnées
-- ---------------------------------------------------------------------------------
CREATE TABLE metadonnees (
    id_metadata UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entite_type VARCHAR(100) NOT NULL,
    entite_id UUID NOT NULL,
    cle_metadata VARCHAR(100) NOT NULL,
    valeur_metadata TEXT,
    type_valeur VARCHAR(50) NOT NULL CHECK (type_valeur IN ('String', 'Number', 'Date', 'Boolean', 'JSON')),
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createur_id UUID REFERENCES personnel(id_personnel),
    UNIQUE(entite_type, entite_id, cle_metadata)
);

CREATE INDEX idx_meta_entite ON metadonnees(entite_type, entite_id);
CREATE INDEX idx_meta_cle ON metadonnees(cle_metadata);

COMMENT ON TABLE metadonnees IS 'Métadonnées flexibles pour tous types d\'entités';

-- ---------------------------------------------------------------------------------
-- Table: logs_systeme - Logs Système
-- ---------------------------------------------------------------------------------
CREATE TABLE logs_systeme (
    id_log UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp_log TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    niveau_log VARCHAR(20) NOT NULL CHECK (niveau_log IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    module_source VARCHAR(100) NOT NULL,
    message_log TEXT NOT NULL,
    utilisateur_id UUID REFERENCES personnel(id_personnel),
    donnees_contexte JSONB,
    stack_trace TEXT,
    adresse_ip VARCHAR(50)
);

CREATE INDEX idx_log_timestamp ON logs_systeme(timestamp_log DESC);
CREATE INDEX idx_log_niveau ON logs_systeme(niveau_log);
CREATE INDEX idx_log_module ON logs_systeme(module_source);
CREATE INDEX idx_log_utilisateur ON logs_systeme(utilisateur_id);

COMMENT ON TABLE logs_systeme IS 'Logs techniques du système';

-- =====================================================================================
-- TABLES D'ASSOCIATION (Many-to-Many)
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Table: tests_normes_applicables - Association Tests <-> Normes
-- ---------------------------------------------------------------------------------
CREATE TABLE tests_normes_applicables (
    test_id UUID NOT NULL REFERENCES tests_industriels(id_test) ON DELETE CASCADE,
    norme_id UUID NOT NULL REFERENCES normes(id_norme) ON DELETE CASCADE,
    application_obligatoire BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (test_id, norme_id)
);

CREATE INDEX idx_test_norme_test ON tests_normes_applicables(test_id);
CREATE INDEX idx_test_norme_norme ON tests_normes_applicables(norme_id);

COMMENT ON TABLE tests_normes_applicables IS 'Association N:N entre tests et normes applicables';

-- ---------------------------------------------------------------------------------
-- Table: tests_instruments - Association Tests <-> Instruments
-- ---------------------------------------------------------------------------------
CREATE TABLE tests_instruments (
    test_id UUID NOT NULL REFERENCES tests_industriels(id_test) ON DELETE CASCADE,
    instrument_id UUID NOT NULL REFERENCES instruments_mesure(id_instrument) ON DELETE CASCADE,
    utilisation VARCHAR(200),
    PRIMARY KEY (test_id, instrument_id)
);

CREATE INDEX idx_test_instr_test ON tests_instruments(test_id);
CREATE INDEX idx_test_instr_instrument ON tests_instruments(instrument_id);

COMMENT ON TABLE tests_instruments IS 'Association N:N entre tests et instruments utilisés';

-- ---------------------------------------------------------------------------------
-- Table: equipements_normes - Association Équipements <-> Normes
-- ---------------------------------------------------------------------------------
CREATE TABLE equipements_normes (
    equipement_id UUID NOT NULL REFERENCES equipements(id_equipement) ON DELETE CASCADE,
    norme_id UUID NOT NULL REFERENCES normes(id_norme) ON DELETE CASCADE,
    conformite_validee BOOLEAN DEFAULT FALSE,
    date_validation DATE,
    PRIMARY KEY (equipement_id, norme_id)
);

CREATE INDEX idx_equip_norme_equip ON equipements_normes(equipement_id);
CREATE INDEX idx_equip_norme_norme ON equipements_normes(norme_id);

COMMENT ON TABLE equipements_normes IS 'Association N:N entre équipements et normes applicables';

-- =====================================================================================
-- VUES MÉTIER
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Vue: Tests en Cours
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_tests_en_cours AS
SELECT 
    t.id_test,
    t.numero_test,
    tt.libelle AS type_test,
    e.code_equipement,
    e.designation AS equipement,
    t.date_test,
    t.statut_test,
    t.resultat_global,
    p.nom || ' ' || p.prenom AS responsable,
    t.niveau_criticite
FROM tests_industriels t
INNER JOIN types_tests tt ON t.type_test_id = tt.id_type_test
INNER JOIN equipements e ON t.equipement_id = e.id_equipement
LEFT JOIN personnel p ON t.responsable_test_id = p.id_personnel
WHERE t.statut_test IN ('Planifié', 'En cours');

COMMENT ON VIEW v_tests_en_cours IS 'Vue des tests actuellement planifiés ou en cours d\'exécution';

-- ---------------------------------------------------------------------------------
-- Vue: Non-Conformités Ouvertes
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_nc_ouvertes AS
SELECT 
    nc.id_nc,
    nc.numero_nc,
    nc.titre,
    nc.niveau_nc,
    nc.criticite_id,
    e.code_equipement,
    e.designation AS equipement,
    nc.date_detection,
    nc.date_limite_traitement,
    p.nom || ' ' || p.prenom AS responsable,
    nc.statut_nc,
    nc.impact_securite,
    nc.impact_production,
    EXTRACT(DAY FROM (nc.date_limite_traitement - CURRENT_TIMESTAMP)) AS jours_restants
FROM non_conformites nc
INNER JOIN equipements e ON nc.equipement_id = e.id_equipement
LEFT JOIN personnel p ON nc.responsable_traitement_id = p.id_personnel
WHERE nc.statut_nc NOT IN ('Résolu', 'Clôturé', 'Annulé');

COMMENT ON VIEW v_nc_ouvertes IS 'Vue des non-conformités ouvertes avec délais';

-- ---------------------------------------------------------------------------------
-- Vue: KPIs Consolidés
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_kpis_consolidation AS
SELECT 
    k.code_kpi,
    k.libelle_kpi,
    k.categorie_kpi,
    k.unite_mesure,
    vk.periode_debut,
    vk.periode_fin,
    vk.valeur_mesuree,
    k.valeur_cible,
    vk.ecart_pct,
    vk.statut,
    vk.commentaire
FROM kpis k
INNER JOIN valeurs_kpi vk ON k.id_kpi = vk.kpi_id
WHERE k.actif = TRUE
ORDER BY vk.periode_debut DESC;

COMMENT ON VIEW v_kpis_consolidation IS 'Vue consolidée des KPIs actifs avec leurs valeurs';

-- ---------------------------------------------------------------------------------
-- Vue: Calibrations à Échéance
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_calibrations_echeance AS
SELECT 
    i.id_instrument,
    i.code_instrument,
    i.designation,
    i.type_instrument,
    i.date_prochaine_calibration,
    EXTRACT(DAY FROM (i.date_prochaine_calibration - CURRENT_DATE)) AS jours_restants,
    i.statut,
    CASE 
        WHEN i.date_prochaine_calibration < CURRENT_DATE THEN 'Expiré'
        WHEN i.date_prochaine_calibration <= CURRENT_DATE + INTERVAL '30 days' THEN 'Alerte'
        ELSE 'OK'
    END AS statut_calibration
FROM instruments_mesure i
WHERE i.statut = 'Opérationnel'
  AND i.date_prochaine_calibration <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY i.date_prochaine_calibration;

COMMENT ON VIEW v_calibrations_echeance IS 'Vue des instruments nécessitant une calibration prochainement';

-- ---------------------------------------------------------------------------------
-- Vue: Planning Hebdomadaire
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_planning_hebdomadaire AS
SELECT 
    p.date_prevue,
    t.numero_test,
    tt.libelle AS type_test,
    e.designation AS equipement,
    p.heure_debut_prevue,
    p.heure_fin_prevue,
    p.duree_prevue_heures,
    p.statut_planning,
    p.priorite,
    pers.nom || ' ' || pers.prenom AS responsable
FROM planning_tests p
INNER JOIN tests_industriels t ON p.test_id = t.id_test
INNER JOIN types_tests tt ON t.type_test_id = tt.id_type_test
INNER JOIN equipements e ON t.equipement_id = e.id_equipement
LEFT JOIN personnel pers ON p.responsable_planning_id = pers.id_personnel
WHERE p.date_prevue BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND p.statut_planning IN ('Planifié', 'Confirmé')
ORDER BY p.date_prevue, p.heure_debut_prevue;

COMMENT ON VIEW v_planning_hebdomadaire IS 'Planning des tests pour la semaine en cours';

-- =====================================================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- Fonction: Mise à jour automatique updated_at
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application aux tables concernées
CREATE TRIGGER update_normes_updated_at BEFORE UPDATE ON normes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON procedures_test FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipements_updated_at BEFORE UPDATE ON equipements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instruments_updated_at BEFORE UPDATE ON instruments_mesure FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests_industriels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nc_updated_at BEFORE UPDATE ON non_conformites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rapports_updated_at BEFORE UPDATE ON rapports_test FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planning_updated_at BEFORE UPDATE ON planning_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------------
-- Fonction: Audit Trail automatique
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_trail_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_trail (type_operation, table_concernee, id_enregistrement, anciennes_valeurs)
        VALUES ('DELETE', TG_TABLE_NAME, OLD.id_test, row_to_json(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_trail (type_operation, table_concernee, id_enregistrement, anciennes_valeurs, nouvelles_valeurs)
        VALUES ('UPDATE', TG_TABLE_NAME, NEW.id_test, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_trail (type_operation, table_concernee, id_enregistrement, nouvelles_valeurs)
        VALUES ('INSERT', TG_TABLE_NAME, NEW.id_test, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Application sur tables critiques (exemples)
CREATE TRIGGER audit_tests_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tests_industriels
    FOR EACH ROW EXECUTE FUNCTION audit_trail_trigger();

CREATE TRIGGER audit_nc_trigger
    AFTER INSERT OR UPDATE OR DELETE ON non_conformites
    FOR EACH ROW EXECUTE FUNCTION audit_trail_trigger();

CREATE TRIGGER audit_mesures_trigger
    AFTER INSERT OR UPDATE OR DELETE ON mesures
    FOR EACH ROW EXECUTE FUNCTION audit_trail_trigger();

-- ---------------------------------------------------------------------------------
-- Fonction: Calcul automatique écart mesures
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calcul_ecart_mesure()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valeur_reference IS NOT NULL THEN
        NEW.ecart_absolu := NEW.valeur_mesuree - NEW.valeur_reference;
        
        IF NEW.valeur_reference != 0 THEN
            NEW.ecart_pct := (NEW.ecart_absolu / NEW.valeur_reference) * 100;
        END IF;
        
        -- Vérification conformité
        IF NEW.tolerance_min IS NOT NULL AND NEW.tolerance_max IS NOT NULL THEN
            NEW.conforme := (NEW.valeur_mesuree BETWEEN NEW.tolerance_min AND NEW.tolerance_max);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcul_ecart
    BEFORE INSERT OR UPDATE ON mesures
    FOR EACH ROW EXECUTE FUNCTION calcul_ecart_mesure();

-- =====================================================================================
-- PERMISSIONS ET SÉCURITÉ (Exemple)
-- =====================================================================================

-- Création de rôles (à adapter selon votre organisation)
CREATE ROLE role_admin;
CREATE ROLE role_ingenieur;
CREATE ROLE role_technicien;
CREATE ROLE role_lecteur;

-- Exemples de permissions (à personnaliser)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO role_admin;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO role_ingenieur;
GRANT SELECT, INSERT ON mesures, observations_test TO role_technicien;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO role_lecteur;

-- =====================================================================================
-- INDEXES COMPLÉMENTAIRES POUR PERFORMANCE
-- =====================================================================================

-- Index pour recherches fréquentes
CREATE INDEX idx_test_date_statut ON tests_industriels(date_test DESC, statut_test);
CREATE INDEX idx_nc_date_statut ON non_conformites(date_detection DESC, statut_nc);
CREATE INDEX idx_mesure_conforme_date ON mesures(conforme, timestamp_mesure DESC);

-- Index pour rapports et analytics
CREATE INDEX idx_kpi_periode_categorie ON valeurs_kpi(periode_debut DESC, kpi_id);
CREATE INDEX idx_rapport_date_type ON rapports_test(date_redaction DESC, type_rapport);

-- Index JSON (pour colonnes JSONB)
CREATE INDEX idx_equip_carac_gin ON equipements USING gin(caracteristiques_techniques);
CREATE INDEX idx_test_conditions_gin ON tests_industriels USING gin(conditions_environnementales);

-- =====================================================================================
-- COMMENTAIRES GÉNÉRAUX
-- =====================================================================================

COMMENT ON SCHEMA public IS 'Schéma de gestion des tests industriels - Version 1.0';

-- =====================================================================================
-- FIN DU SCHÉMA
-- =====================================================================================

-- Statistiques initiales
VACUUM ANALYZE;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '=====================================================================================';
    RAISE NOTICE 'SCHÉMA DE BASE DE DONNÉES TESTS INDUSTRIELS - INSTALLATION TERMINÉE';
    RAISE NOTICE '=====================================================================================';
    RAISE NOTICE 'Version: 1.0';
    RAISE NOTICE 'SGBD: PostgreSQL';
    RAISE NOTICE 'Total tables: 85+';
    RAISE NOTICE 'Total vues: 5';
    RAISE NOTICE 'Total triggers: 12+';
    RAISE NOTICE '=====================================================================================';
    RAISE NOTICE 'Domaines fonctionnels couverts:';
    RAISE NOTICE '  1. Référentiels et Classification';
    RAISE NOTICE '  2. Processus de Tests';
    RAISE NOTICE '  3. Équipements et Instrumentation';
    RAISE NOTICE '  4. Ressources Humaines et Organismes';
    RAISE NOTICE '  5. Exécution et Résultats';
    RAISE NOTICE '  6. Conformité et Non-Conformités';
    RAISE NOTICE '  7. Reporting et KPIs';
    RAISE NOTICE '  8. Planification et Calendrier';
    RAISE NOTICE '  9. Traçabilité et Archivage';
    RAISE NOTICE '=====================================================================================';
    RAISE NOTICE '  Prochaines étapes recommandées:';
    RAISE NOTICE '  - Adapter les rôles et permissions selon votre organisation';
    RAISE NOTICE '  - Charger les données de référence (normes, types de tests, etc.)';
    RAISE NOTICE '  - Configurer les sauvegardes automatiques';
    RAISE NOTICE '  - Mettre en place la supervision';
    RAISE NOTICE '=====================================================================================';
END $$;
