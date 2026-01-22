<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Equipement;
use Illuminate\Support\Str;

class EquipementSeeder extends Seeder
{
    public function run(): void
    {
        $equipements = [
            [
                'code_equipement' => 'EQ-PR-001',
                'designation' => 'Presse Hydraulique 500T',
                'fabricant' => 'HydrauMax',
                'modele' => 'HM-500-X1',
                'numero_serie' => 'SN-88291-HY',
                'annee_fabrication' => 2022,
                'date_mise_service' => '2022-06-15',
                'categorie_equipement' => 'Production',
                'sous_categorie' => 'Presse',
                'localisation_site' => 'Site Marignane',
                'localisation_precise' => 'Atelier 4 - Zone C',
                'puissance_nominale_kw' => 45.5,
                'niveau_criticite' => 3,
                'statut_operationnel' => 'En service',
            ],
            [
                'code_equipement' => 'EQ-GE-002',
                'designation' => 'Groupe Électrogène 1000kVA',
                'fabricant' => 'Caterpillar',
                'modele' => 'GE-1000-CAT',
                'numero_serie' => 'SN-10293-GE',
                'annee_fabrication' => 2021,
                'date_mise_service' => '2021-03-10',
                'categorie_equipement' => 'Énergie',
                'sous_categorie' => 'Groupe Électrogène',
                'localisation_site' => 'Site Marignane',
                'localisation_precise' => 'Local technique 2',
                'puissance_nominale_kw' => 800.0,
                'niveau_criticite' => 4,
                'statut_operationnel' => 'En service',
            ],
            [
                'code_equipement' => 'EQ-CO-003',
                'designation' => 'Compresseur d\'Air Industriel',
                'fabricant' => 'Atlas Copco',
                'modele' => 'AC-GA-30',
                'numero_serie' => 'SN-55677-CO',
                'annee_fabrication' => 2023,
                'date_mise_service' => '2023-01-20',
                'categorie_equipement' => 'Utilités',
                'sous_categorie' => 'Compresseur',
                'localisation_site' => 'Site Istres',
                'localisation_precise' => 'Bâtiment B - Sous-sol',
                'puissance_nominale_kw' => 30.0,
                'niveau_criticite' => 2,
                'statut_operationnel' => 'Maintenance',
            ],
        ];

        foreach ($equipements as $equipement) {
            Equipement::firstOrCreate(
                ['code_equipement' => $equipement['code_equipement']],
                array_merge($equipement, [
                    'id_equipement' => Str::uuid()->toString(),
                    'caracteristiques_techniques' => json_encode(['version' => '1.0']),
                ])
            );
        }

        $this->command->info('✅ 3 équipements de test créés');
    }
}
