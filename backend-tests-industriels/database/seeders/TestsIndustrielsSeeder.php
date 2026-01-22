<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TestIndustriel;
use App\Models\TypeTest;
use App\Models\PhaseTest;
use App\Models\Equipement;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TestsIndustrielsSeeder extends Seeder
{
    public function run(): void
    {
        // Récupération des références
        $typeReglementaire = TypeTest::where('code_type', 'REG-ELEC')->first();
        $typeFonctionnel = TypeTest::where('code_type', 'PERF-MEC')->first();
        $typeSecurite = TypeTest::where('code_type', 'SEC-ATEX')->first();
        
        $phasePreparation = PhaseTest::where('code_phase', 'PHASE_1')->first();
        $phaseExecution = PhaseTest::where('code_phase', 'PHASE_2')->first();
        
        $equipement1 = Equipement::where('code_equipement', 'EQ-PR-001')->first();
        $equipement2 = Equipement::where('code_equipement', 'EQ-GE-002')->first();

        $tests = [
            [
                'numero_test' => 'TEST-2026-001',
                'type_test_id' => $typeReglementaire?->id_type_test,
                'equipement_id' => $equipement1?->id_equipement,
                'phase_id' => $phasePreparation?->id_phase,
                'date_test' => Carbon::now()->addDays(2),
                'localisation' => 'Atelier 4',
                'niveau_criticite' => 3,
                'statut_test' => 'PLANIFIE',
                'observations_generales' => 'Test de conformité pression selon norme ISO 9001',
                'arret_production_requis' => true,
            ],
            [
                'numero_test' => 'TEST-2026-002',
                'type_test_id' => $typeFonctionnel?->id_type_test,
                'equipement_id' => $equipement2?->id_equipement,
                'phase_id' => $phaseExecution?->id_phase,
                'date_test' => Carbon::now()->subDays(1),
                'heure_debut' => '08:00:00',
                'localisation' => 'Local technique 2',
                'niveau_criticite' => 2,
                'statut_test' => 'EN_COURS',
                'observations_generales' => 'Validation fonctionnement système électrique',
            ],
            [
                'numero_test' => 'TEST-2026-003',
                'type_test_id' => $typeSecurite?->id_type_test,
                'equipement_id' => $equipement1?->id_equipement,
                'phase_id' => $phasePreparation?->id_phase,
                'date_test' => Carbon::now()->addDays(5),
                'localisation' => 'Atelier 4',
                'niveau_criticite' => 4,
                'statut_test' => 'PLANIFIE',
                'observations_generales' => 'Vérification système arrêt d\'urgence',
            ],
        ];

        foreach ($tests as $testData) {
            TestIndustriel::updateOrCreate(
                ['numero_test' => $testData['numero_test']],
                array_merge($testData, [
                    // id_test only on create if possible, but updateOrCreate will use it if provided
                    'id_test' => Str::uuid()->toString(),
                    'conditions_environnementales' => ['temp' => '20°C', 'hum' => '45%'],
                ])
            );
        }

        $this->command->info('✅ 3 tests industriels fictifs créés');
    }
}
