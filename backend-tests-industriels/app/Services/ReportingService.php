<?php

namespace App\Services;

use App\Models\TestIndustriel;
use App\Models\NonConformite;
use App\Models\Equipement;
use App\Models\RapportTest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    /**
     * Obtenir les données de performance globale (KPIs)
     */
    public function getPerformanceStats(): array
    {
        $now = now();
        $sixMonthsAgo = now()->subMonths(6);

        // 1. Taux de conformité mensuel
        $monthlyConformity = [];
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthLabel = $date->format('M Y');
            $months[] = $monthLabel;

            $total = TestIndustriel::whereYear('date_test', $date->year)
                ->whereMonth('date_test', $date->month)
                ->count();
            
            $conformes = TestIndustriel::whereYear('date_test', $date->year)
                ->whereMonth('date_test', $date->month)
                ->where('resultat_global', 'CONFORME')
                ->count();

            $monthlyConformity[] = $total > 0 ? round(($conformes / $total) * 100, 1) : 0;
        }

        // 2. Distribution par Type de Test
        $testTypeDistribution = DB::table('tests_industriels')
            ->join('types_tests', 'tests_industriels.id_type_test', '=', 'types_tests.id_type_test')
            ->select('types_tests.libelle as label', DB::raw('count(*) as value'))
            ->groupBy('types_tests.libelle')
            ->orderBy('value', 'desc')
            ->get();

        // 3. Top Equipements avec Non-Conformités
        $topEquipementIssues = DB::table('non_conformites')
            ->join('equipements', 'non_conformites.id_equipement', '=', 'equipements.id_equipement')
            ->select('equipements.designation as label', DB::raw('count(*) as value'))
            ->groupBy('equipements.designation')
            ->orderBy('value', 'desc')
            ->take(5)
            ->get();

        // 4. Délai moyen de résolution des NC (clôturées)
        $avgResolutionTime = NonConformite::where('statut', 'CLOTUREE')
            ->whereNotNull('date_cloture')
            ->selectRaw('AVG(DATEDIFF(date_cloture, date_detection)) as avg_days')
            ->value('avg_days');

        return [
            'summary' => [
                'conformity_rate' => $this->getGlobalConformityRate(),
                'avg_resolution_days' => round($avgResolutionTime ?? 0, 1),
                'total_nc_active' => NonConformite::whereIn('statut', ['OUVERTE', 'EN_COURS'])->count(),
                'critical_nc_count' => NonConformite::whereHas('criticite', function($q) {
                    $q->where('code_niveau', 'LIKE', '%L3%')->orWhere('code_niveau', 'LIKE', '%L4%');
                })->count(),
            ],
            'conformity_trend' => [
                'categories' => $months,
                'series' => [
                    ['name' => 'Taux Conformité (%)', 'data' => $monthlyConformity]
                ]
            ],
            'test_types' => $testTypeDistribution,
            'top_issues' => $topEquipementIssues,
            'nc_by_criticality' => $this->getNcCriticalityDistribution()
        ];
    }

    private function getGlobalConformityRate(): float
    {
        $total = TestIndustriel::count();
        if ($total === 0) return 0;
        
        $conformes = TestIndustriel::where('resultat_global', 'CONFORME')->count();
        return round(($conformes / $total) * 100, 1);
    }

    private function getNcCriticalityDistribution(): array
    {
        return NonConformite::selectRaw('criticite_id, count(*) as count')
            ->with('criticite')
            ->groupBy('criticite_id')
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->criticite ? $item->criticite->code_niveau : 'Inconnu',
                    'value' => $item->count,
                    'color' => $item->criticite ? $item->criticite->couleur_indicateur : '#94a3b8'
                ];
            })->toArray();
    }

    /**
     * Obtenir la liste des rapports générés
     */
    public function getReportsList(): \Illuminate\Database\Eloquent\Collection
    {
        return RapportTest::with(['test.equipement', 'redacteur'])
            ->orderBy('date_edition', 'desc')
            ->get();
    }

    /**
     * Créer un nouveau rapport
     */
    public function createReport(array $data): RapportTest
    {
        // Générer un numéro de rapport unique
        $test = TestIndustriel::findOrFail($data['test_id']);
        $numeroRapport = 'REP-' . $test->numero_test . '-' . strtoupper(substr(uniqid(), -4));

        return RapportTest::create([
            'test_id' => $data['test_id'],
            'numero_rapport' => $numeroRapport,
            'type_rapport' => $data['type_rapport'],
            'date_edition' => $data['date_edition'],
            'redacteur_id' => $data['redacteur_id'],
            'statut' => 'BROUILLON', // Par défaut
            'resume_executif' => $data['resume_executif'] ?? 'Résumé non fourni.',
        ]);
    }
}
