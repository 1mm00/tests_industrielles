<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Poste;

class PosteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $postes = [
            // Postes Techniques / Ingénierie - Pour Ingénieurs
            ['libelle' => 'Ingénieur Qualité Senior', 'categorie' => 'Ingénierie', 'niveau_requis' => 'Ingénieur', 'actif' => true],
            ['libelle' => 'Ingénieur Tests et Essais', 'categorie' => 'Technique', 'niveau_requis' => 'Ingénieur', 'actif' => true],
            ['libelle' => 'Ingénieur R&D', 'categorie' => 'Ingénierie', 'niveau_requis' => 'Ingénieur', 'actif' => true],
            ['libelle' => 'Ingénieur Méthodes', 'categorie' => 'Ingénierie', 'niveau_requis' => 'Ingénieur', 'actif' => true],
            ['libelle' => 'Responsable Validation', 'categorie' => 'Technique', 'niveau_requis' => 'Ingénieur', 'actif' => true],

            // Postes Techniques / Production - Pour Techniciens
            ['libelle' => 'Technicien de Tests', 'categorie' => 'Technique', 'niveau_requis' => 'BTS/DUT', 'actif' => true],
            ['libelle' => 'Technicien de Maintenance', 'categorie' => 'Technique', 'niveau_requis' => 'BTS/DUT', 'actif' => true],
            ['libelle' => 'Technicien Qualité', 'categorie' => 'Production', 'niveau_requis' => 'BTS/DUT', 'actif' => true],
            ['libelle' => 'Opérateur Production', 'categorie' => 'Production', 'niveau_requis' => 'CAP/BEP', 'actif' => true],
            ['libelle' => 'Technicien Métrologie', 'categorie' => 'Technique', 'niveau_requis' => 'BTS/DUT', 'actif' => true],

            // Postes Administratifs / Gestion - Pour Admin
            ['libelle' => 'Administrateur Système', 'categorie' => 'Administratif', 'niveau_requis' => 'Licence', 'actif' => true],
            ['libelle' => 'Responsable Qualité', 'categorie' => 'Gestion', 'niveau_requis' => 'Master', 'actif' => true],
            ['libelle' => 'Chef de Projet', 'categorie' => 'Gestion', 'niveau_requis' => 'Ingénieur', 'actif' => true],
            ['libelle' => 'Gestionnaire de Stock', 'categorie' => 'Administratif', 'niveau_requis' => 'BTS/DUT', 'actif' => true],

            // Postes Documentation - Pour Lecteur
            ['libelle' => 'Responsable Documentation', 'categorie' => 'Documentation', 'niveau_requis' => 'Licence', 'actif' => true],
            ['libelle' => 'Archiviste Technique', 'categorie' => 'Administratif', 'niveau_requis' => 'BTS/DUT', 'actif' => true],
            ['libelle' => 'Assistant Qualité', 'categorie' => 'Documentation', 'niveau_requis' => 'BTS/DUT', 'actif' => true],
        ];

        foreach ($postes as $poste) {
            Poste::firstOrCreate(
                ['libelle' => $poste['libelle']],
                $poste
            );
        }

        $this->command->info('✅ ' . count($postes) . ' postes créés avec succès');
    }
}
