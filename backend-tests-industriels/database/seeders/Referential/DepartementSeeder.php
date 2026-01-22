<?php

namespace Database\Seeders\Referential;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartementSeeder extends Seeder
{
    public function run(): void
    {
        $departements = [
            // Départements Techniques
            ['libelle' => 'Bureau d\'Essais', 'categorie' => 'Technique', 'site' => 'Site Marignane'],
            ['libelle' => 'Bureau d\'Études', 'categorie' => 'Technique', 'site' => 'Site Marignane'],
            ['libelle' => 'Laboratoire de Tests', 'categorie' => 'Technique', 'site' => 'Site Istres'],
            ['libelle' => 'Service Métrologie', 'categorie' => 'Technique', 'site' => 'Site Marignane'],
            ['libelle' => 'Maintenance Industrielle', 'categorie' => 'Technique', 'site' => 'Site Marignane'],
            
            // Départements Qualité/Sécurité
            ['libelle' => 'Qualité Industrielle', 'categorie' => 'Qualité', 'site' => 'Siège'],
            ['libelle' => 'Assurance Qualité', 'categorie' => 'Qualité', 'site' => 'Siège'],
            ['libelle' => 'HSE (Hygiène Sécurité Environnement)', 'categorie' => 'Sécurité', 'site' => 'Siège'],
            ['libelle' => 'Contrôle Qualité', 'categorie' => 'Qualité', 'site' => 'Site Marignane'],
            
            // Départements Support
            ['libelle' => 'DSI (Direction des Systèmes d\'Information)', 'categorie' => 'Support', 'site' => 'Siège'],
            ['libelle' => 'Documentation Technique', 'categorie' => 'Support', 'site' => 'Siège'],
            ['libelle' => 'Logistique', 'categorie' => 'Support', 'site' => 'Site Marignane'],
            ['libelle' => 'Production', 'categorie' => 'Opérationnel', 'site' => 'Site Marignane'],
            
            // Départements de Direction
            ['libelle' => 'Direction Technique', 'categorie' => 'Direction', 'site' => 'Siège'],
            ['libelle' => 'Direction Qualité', 'categorie' => 'Direction', 'site' => 'Siège'],
        ];

        foreach ($departements as $departement) {
            DB::table('departements')->insert(array_merge($departement, [
                'actif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('✅ ' . count($departements) . ' départements créés');
    }
}
