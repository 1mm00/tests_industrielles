<?php

namespace Database\Seeders\Referential;

use Illuminate\Database\Seeder;
use App\Models\NiveauCriticite;
use Illuminate\Support\Str;

class NiveauCriticiteSeeder extends Seeder
{
    public function run(): void
    {
        $niveaux = [
            [
                'code_niveau' => 'NC1',
                'libelle' => 'Mineure',
                'description' => 'Non-conformité mineure sans impact significatif',
                'delai_traitement_max_heures' => 168, // 7 jours
                'couleur_indicateur' => '#FFC107', // Orange clair
                'ordre_affichage' => 1,
            ],
            [
                'code_niveau' => 'NC2',
                'libelle' => 'Moyenne',
                'description' => 'Non-conformité moyenne nécessitant un traitement prioritaire',
                'delai_traitement_max_heures' => 72, // 3 jours
                'couleur_indicateur' => '#FF9800', // Orange
                'ordre_affichage' => 2,
            ],
            [
                'code_niveau' => 'NC3',
                'libelle' => 'Majeure',
                'description' => 'Non-conformité majeure à fort impact',
                'delai_traitement_max_heures' => 24, // 1 jour
                'couleur_indicateur' => '#FF5722', // Orange foncé
                'ordre_affichage' => 3,
            ],
            [
                'code_niveau' => 'NC4',
                'libelle' => 'Critique',
                'description' => 'Non-conformité critique - traitement immédiat requis',
                'delai_traitement_max_heures' => 4, // 4 heures
                'couleur_indicateur' => '#F44336', // Rouge
                'ordre_affichage' => 4,
            ],
        ];

        foreach ($niveaux as $niveau) {
            NiveauCriticite::firstOrCreate(
                ['code_niveau' => $niveau['code_niveau']],
                array_merge($niveau, [
                    'id_niveau_criticite' => Str::uuid()->toString()
                ])
            );
        }
    }
}
