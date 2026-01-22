<?php

namespace Database\Seeders\Referential;

use Illuminate\Database\Seeder;
use App\Models\PhaseTest;
use Illuminate\Support\Str;

class PhaseTestSeeder extends Seeder
{
    public function run(): void
    {
        $phases = [
            [
                'code_phase' => 'PHASE_1',
                'nom_phase' => 'Préparation',
                'description' => 'Phase de préparation et planification du test',
                'ordre_execution' => 1,
                'duree_estimee_heures' => 2,
                'obligatoire' => true,
            ],
            [
                'code_phase' => 'PHASE_2',
                'nom_phase' => 'Exécution',
                'description' => 'Phase d\'exécution effective du test',
                'ordre_execution' => 2,
                'duree_estimee_heures' => 4,
                'obligatoire' => true,
            ],
            [
                'code_phase' => 'PHASE_3',
                'nom_phase' => 'Analyse',
                'description' => 'Phase d\'analyse des résultats et mesures',
                'ordre_execution' => 3,
                'duree_estimee_heures' => 3,
                'obligatoire' => true,
            ],
            [
                'code_phase' => 'PHASE_4',
                'nom_phase' => 'Clôture',
                'description' => 'Phase de clôture et génération du rapport',
                'ordre_execution' => 4,
                'duree_estimee_heures' => 1,
                'obligatoire' => true,
            ],
        ];

        foreach ($phases as $phase) {
            PhaseTest::firstOrCreate(
                ['code_phase' => $phase['code_phase']],
                array_merge($phase, [
                    'id_phase' => Str::uuid()->toString()
                ])
            );
        }
    }
}
