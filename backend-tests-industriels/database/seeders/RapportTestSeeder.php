<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RapportTest;
use App\Models\TestIndustriel;
use App\Models\Personnel;

class RapportTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer quelques tests terminés
        $tests = TestIndustriel::where('statut_test', 'TERMINE')->take(5)->get();
        
        if ($tests->isEmpty()) {
            $this->command->info('Aucun test terminé trouvé. Veuillez d\'abord exécuter le TestsSeeder.');
            return;
        }

        // Récupérer le personnel pour les rédacteurs/valideurs
        $personnel = Personnel::all();
        
        if ($personnel->isEmpty()) {
            $this->command->warn('Aucun personnel trouvé. Les rapports seront créés sans rédacteur.');
        }

        foreach ($tests as $index => $test) {
            $statut = ['BROUILLON', 'EN_REVISION', 'VALIDE'][array_rand(['BROUILLON', 'EN_REVISION', 'VALIDE'])];
            
            $annee = date('Y');
            $numero = str_pad($index + 1, 4, '0', STR_PAD_LEFT);
            
            $rapport = RapportTest::create([
                'test_id' => $test->id_test,
                'numero_rapport' => "RPT-{$annee}-{$numero}",
                'type_rapport' => 'RAPPORT_VALIDATION',
                'date_edition' => now()->subDays(rand(1, 30)),
                'redacteur_id' => $personnel->isNotEmpty() ? $personnel->random()->id_personnel : null,
                'valideur_id' => $statut === 'VALIDE' && $personnel->count() > 1 
                    ? $personnel->where('id_personnel', '!=', $personnel->random()->id_personnel)->random()->id_personnel 
                    : null,
                'date_validation' => $statut === 'VALIDE' ? now()->subDays(rand(1, 15)) : null,
                'statut' => $statut,
                'resume_executif' => "Synthèse du test {$test->numero_test}: " . ($test->resultat_global === 'CONFORME' ? 'Équipement conforme aux spécifications.' : 'Non-conformités détectées nécessitant correction.'),
                'structure_rapport' => [
                    'version' => '1.0',
                    'versions' => [
                        [
                            'version' => '1.0',
                            'date' => now()->subDays(rand(1, 30))->format('Y-m-d'),
                            'modifications' => 'Création initiale du rapport',
                            'auteur' => $personnel->isNotEmpty() ? $personnel->random()->nom_complet : 'Système'
                        ]
                    ],
                    'references' => [
                        ['ISO 9001:2015', 'Systèmes de management de la qualité'],
                        ['NF EN 13445', 'Appareils à pression non soumis à la flamme']
                    ],
                    'systeme' => "Équipement: {$test->equipement->designation}\nCode: {$test->equipement->code_equipement}\nLocalisation: {$test->localisation}",
                    'perimetre' => "Test: {$test->type_test->libelle}\nCriticité: Niveau {$test->niveau_criticite}\nNombre de mesures: " . $test->mesures->count(),
                    'environnement' => 'Conditions normales de service',
                    'strategie' => 'Approche systématique avec traçabilité complète',
                    'recommandations' => $test->resultat_global === 'CONFORME' 
                        ? '- Maintenir la surveillance périodique\n- Planifier le prochain test selon le calendrier' 
                        : '- Corriger les non-conformités identifiées\n- Effectuer un retest après correction'
                ],
            ]);

            $this->command->info("Rapport créé: {$rapport->numero_rapport} - Statut: {$statut}");
        }

        $this->command->info('✓ RapportTestSeeder terminé avec succès!');
    }
}
