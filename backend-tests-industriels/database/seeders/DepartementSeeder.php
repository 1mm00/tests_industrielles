<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Departement;

class DepartementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departements = [
            // Départements Techniques / Qualité / R&D - Pour Ingénieurs
            ['libelle' => 'Bureau d\'Études', 'categorie' => 'Technique', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Qualité Industrielle', 'categorie' => 'Qualité', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Recherche & Développement', 'categorie' => 'R&D', 'site' => 'Site Marignane', 'actif' => true],
            ['libelle' => 'Ingénierie Process', 'categorie' => 'Technique', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Laboratoire d\'Essais', 'categorie' => 'Qualité', 'site' => 'Site Istres', 'actif' => true],

            // Départements Techniques / Production / Maintenance - Pour Techniciens
            ['libelle' => 'Atelier de Production', 'categorie' => 'Production', 'site' => 'Site Marignane', 'actif' => true],
            ['libelle' => 'Maintenance Industrielle', 'categorie' => 'Maintenance', 'site' => 'Site Marignane', 'actif' => true],
            ['libelle' => 'Métrologie & Calibration', 'categorie' => 'Technique', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Contrôle Qualité Terrain', 'categorie' => 'Production', 'site' => 'Site Istres', 'actif' => true],

            // Départements Direction / Support / Administratif - Pour Admin
            ['libelle' => 'Direction Générale', 'categorie' => 'Direction', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Direction des Systèmes d\'Information', 'categorie' => 'Support', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Ressources Humaines', 'categorie' => 'Support', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Achats et Logistique', 'categorie' => 'Administratif', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Finances et Comptabilité', 'categorie' => 'Administratif', 'site' => 'Siège', 'actif' => true],

            // Départements Documentation / Support - Pour Lecteur
            ['libelle' => 'Documentation Technique', 'categorie' => 'Documentation', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Archivage et Gestion Documentaire', 'categorie' => 'Support', 'site' => 'Siège', 'actif' => true],
            ['libelle' => 'Bibliothèque Normes et Standards', 'categorie' => 'Documentation', 'site' => 'Siège', 'actif' => true],
        ];

        foreach ($departements as $departement) {
            Departement::firstOrCreate(
                ['libelle' => $departement['libelle']],
                $departement
            );
        }

        $this->command->info('✅ ' . count($departements) . ' départements créés avec succès');
    }
}
