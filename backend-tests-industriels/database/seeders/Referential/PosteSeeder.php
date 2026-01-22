<?php

namespace Database\Seeders\Referential;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PosteSeeder extends Seeder
{
    public function run(): void
    {
        $postes = [
            // Postes Techniques
            ['libelle' => 'Ingénieur Qualité Senior', 'categorie' => 'Technique', 'niveau_requis' => 'Ingénieur'],
            ['libelle' => 'Ingénieur Tests Industriels', 'categorie' => 'Technique', 'niveau_requis' => 'Ingénieur'],
            ['libelle' => 'Ingénieur Méthodes', 'categorie' => 'Technique', 'niveau_requis' => 'Ingénieur'],
            ['libelle' => 'Technicien de Tests', 'categorie' => 'Technique', 'niveau_requis' => 'BTS/DUT'],
            ['libelle' => 'Technicien Qualité', 'categorie' => 'Technique', 'niveau_requis' => 'BTS/DUT'],
            ['libelle' => 'Technicien de Maintenance', 'categorie' => 'Technique', 'niveau_requis' => 'BTS/DUT'],
            ['libelle' => 'Métrologue', 'categorie' => 'Technique', 'niveau_requis' => 'Licence'],
            ['libelle' => 'Opérateur de Tests', 'categorie' => 'Technique', 'niveau_requis' => 'BTS/DUT'],
            
            // Postes de Gestion
            ['libelle' => 'Responsable Bureau d\'Essais', 'categorie' => 'Gestion', 'niveau_requis' => 'Ingénieur'],
            ['libelle' => 'Responsable Qualité', 'categorie' => 'Gestion', 'niveau_requis' => 'Ingénieur'],
            ['libelle' => 'Chef de Projet Tests', 'categorie' => 'Gestion', 'niveau_requis' => 'Ingénieur'],
            ['libelle' => 'Coordinateur Tests', 'categorie' => 'Gestion', 'niveau_requis' => 'Licence'],
            
            // Postes Administratifs
            ['libelle' => 'Administrateur Système', 'categorie' => 'Administratif', 'niveau_requis' => 'Licence'],
            ['libelle' => 'Responsable Documentation', 'categorie' => 'Administratif', 'niveau_requis' => 'Licence'],
            ['libelle' => 'Assistant Qualité', 'categorie' => 'Administratif', 'niveau_requis' => 'BTS/DUT'],
        ];

        foreach ($postes as $poste) {
            DB::table('postes')->insert(array_merge($poste, [
                'actif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('✅ ' . count($postes) . ' postes créés');
    }
}
