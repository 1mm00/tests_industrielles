<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TestIndustriel;
use App\Models\NonConformite;
use App\Models\Equipement;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Enums\TestStatutEnum;
use App\Enums\TestResultatEnum;

class DashboardController extends Controller
{
    /**
     * Dashboard Ingénieur - Vue complète pour pilotage stratégique
     */
    public function getDashboardIngenieur()
    {
        // ========== KPIs STRATÉGIQUES ==========
        $totalTests = TestIndustriel::count();
        $testsTermines = TestIndustriel::where('statut_test', 'TERMINE')->count();
        
        // Taux de conformité global
        $tauxConformite = $testsTermines > 0 
            ? (TestIndustriel::where('statut_test', 'TERMINE')
                ->where('resultat_global', 'CONFORME')
                ->count() / $testsTermines) * 100
            : 0;

        // Non-conformités actives (non résolues)
        $ncActives = NonConformite::whereNotIn('statut', ['CLOTUREE', 'RESOLUE'])->count();
        
        // Non-conformités critiques (On cherche via la relation criticite)
        $ncCritiques = NonConformite::whereHas('criticite', function($query) {
            $query->whereIn('code_niveau', ['NC4', 'CRITIQUE']);
        })->whereNotIn('statut', ['CLOTUREE', 'RESOLUE'])->count();

        // ========== PERFORMANCE TECHNIQUE (12 DERNIERS MOIS) ==========
        $performanceData = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $mois = Carbon::now()->subMonths($i);
            $moisLabel = ucfirst($mois->locale('fr')->translatedFormat('M'));
            
            $testsConformes = TestIndustriel::where('statut_test', 'TERMINE')
                ->where('resultat_global', 'CONFORME')
                ->whereYear('date_test', $mois->year)
                ->whereMonth('date_test', $mois->month)
                ->count();
                
            $testsTotalMois = TestIndustriel::where('statut_test', 'TERMINE')
                ->whereYear('date_test', $mois->year)
                ->whereMonth('date_test', $mois->month)
                ->count();
                
            $nonConformites = NonConformite::whereYear('date_detection', $mois->year)
                ->whereMonth('date_detection', $mois->month)
                ->count();
            
            $performanceData[] = [
                'mois' => $moisLabel,
                'tests_reussis' => $testsTotalMois,
                'tests_conformes' => $testsConformes,
                'non_conformites' => $nonConformites,
            ];
        }

        // ========== ACTIONS REQUISES ==========
        $actionsRequises = TestIndustriel::with(['equipement', 'typeTest'])
            ->whereIn('statut_test', ['PLANIFIE', 'EN_COURS'])
            ->where('niveau_criticite', '>=', 1) // Souple pour demo
            ->orderBy('date_test', 'asc')
            ->limit(4)
            ->get()
            ->map(function ($test) {
                return [
                    'id_test' => $test->id_test,
                    'numero_test' => $test->numero_test,
                    'type' => $test->typeTest?->libelle ?? 'Test',
                    'equipement' => $test->equipement?->designation ?? 'Équipement',
                    'code_equipement' => $test->equipement?->code_equipement ?? 'N/A',
                    'statut' => $test->statut_test,
                    'date_planifiee' => $test->date_test?->format('d/m/Y') ?? 'À venir',
                    'criticite' => $test->niveau_criticite,
                ];
            });

        // ========== EXPERTISE ÉQUIPEMENT ==========
        $expertiseEquipement = Equipement::withCount([
            'testsIndustriels as tests_total',
            'testsIndustriels as tests_nc' => function ($query) {
                $query->where('resultat_global', 'NON_CONFORME');
            }
        ])
            ->get() // enlevé le having pour s'assurer d'avoir des données
            ->map(function ($equipement) {
                return [
                    'id_equipement' => $equipement->id_equipement,
                    'designation' => $equipement->designation,
                    'code' => $equipement->code_equipement,
                    'total_tests' => $equipement->tests_total,
                    'total_nc' => $equipement->tests_nc,
                    'taux_echec' => $equipement->tests_total > 0 
                        ? round(($equipement->tests_nc / $equipement->tests_total) * 100, 1)
                        : 0,
                ];
            })
            ->sortByDesc('taux_echec')
            ->take(5)
            ->values();

        // ========== STATISTIQUES COMPLÉMENTAIRES ==========
        $statsComplementaires = [
            'tests_en_cours' => TestIndustriel::where('statut_test', 'EN_COURS')->count(),
            'tests_planifies' => TestIndustriel::where('statut_test', 'PLANIFIE')->count(),
            'tests_suspendus' => TestIndustriel::where('statut_test', 'SUSPENDU')->count(),
            'nc_resolues_ce_mois' => NonConformite::where('statut', 'CLOTUREE')
                ->whereYear('date_cloture', Carbon::now()->year)
                ->whereMonth('date_cloture', Carbon::now()->month)
                ->count(),
        ];

        return response()->json([
            'kpis' => [
                'taux_conformite' => round($tauxConformite, 1),
                'nc_actives' => $ncActives,
                'nc_critiques' => $ncCritiques,
                'tests_totaux' => $totalTests,
            ],
            'performance_12_mois' => $performanceData,
            'actions_requises' => $actionsRequises,
            'expertise_equipement' => $expertiseEquipement,
            'stats_complementaires' => $statsComplementaires,
        ]);
    }

    /**
     * Dashboard Technicien - Vue opérationnelle pour exécution terrain
     */
    public function getDashboardTechnicien()
    {
        // Tests assignés au technicien (si authentifié)
        $testsAujourdhui = TestIndustriel::with(['equipement', 'typeTest'])
            ->whereDate('date_test', Carbon::today())
            ->whereIn('statut_test', ['PLANIFIE', 'EN_COURS'])
            ->orderBy('niveau_criticite', 'desc')
            ->get();

        $testsSemaine = TestIndustriel::with(['equipement', 'typeTest'])
            ->whereBetween('date_test', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->whereIn('statut_test', ['PLANIFIE'])
            ->orderBy('date_test', 'asc')
            ->get();

        return response()->json([
            'tests_aujourdhui' => $testsAujourdhui,
            'tests_semaine' => $testsSemaine,
            'total_aujourdhui' => $testsAujourdhui->count(),
            'total_semaine' => $testsSemaine->count(),
        ]);
    }

    /**
     * Générer le rapport analytique executive en PDF
     */
    public function downloadAnalyticsPdf()
    {
        try {
            // Reprendre la logique de getDashboardIngenieur pour la cohérence
            $totalTests = TestIndustriel::count();
            $testsTermines = TestIndustriel::where('statut_test', TestStatutEnum::TERMINE)->count();
            $tauxConformite = $testsTermines > 0 
                ? (TestIndustriel::where('statut_test', TestStatutEnum::TERMINE)->where('resultat_global', TestResultatEnum::CONFORME)->count() / $testsTermines) * 100
                : 0;

            // 1. Performance 12 mois
            $performanceData = [];
            for ($i = 11; $i >= 0; $i--) {
                $mois = Carbon::now()->subMonths($i);
                $testsTotalMois = TestIndustriel::where('statut_test', TestStatutEnum::TERMINE)->whereYear('date_test', $mois->year)->whereMonth('date_test', $mois->month)->count();
                $testsConformes = TestIndustriel::where('statut_test', TestStatutEnum::TERMINE)->where('resultat_global', TestResultatEnum::CONFORME)->whereYear('date_test', $mois->year)->whereMonth('date_test', $mois->month)->count();
                $performanceData[] = [
                    'mois' => ucfirst($mois->locale('fr')->translatedFormat('M')),
                    'tests_reussis' => $testsTotalMois,
                    'tests_conformes' => $testsConformes,
                ];
            }

            // 2. Alertes critiques non traitées
            $criticalAlerts = NonConformite::with(['equipement', 'criticite'])
                ->whereHas('criticite', function($query) {
                    $query->whereIn('code_niveau', ['NC3', 'NC4', 'CRITIQUE']);
                })
                ->whereNotIn('statut', ['CLOTUREE', 'RESOLUE'])
                ->orderBy('date_detection', 'desc')
                ->limit(5)
                ->get();

            // 3. Stats Équipe
            $teamStats = \App\Models\Personnel::selectRaw('departement, count(*) as count')
                ->whereNotNull('departement')
                ->groupBy('departement')
                ->get()
                ->map(function($dept) {
                    $responsable = \App\Models\Personnel::where('departement', $dept->departement)
                        ->whereHas('role', function($q) { $q->where('nom_role', 'LIKE', '%Chef%')->orWhere('nom_role', 'LIKE', '%Ingenieur%'); })
                        ->first();
                    
                    return [
                        'departement' => $dept->departement,
                        'count' => $dept->count,
                        'interventions' => TestIndustriel::whereHas('responsable', function($q) use ($dept) {
                            $q->where('departement', $dept->departement);
                        })->count(),
                        'responsable' => $responsable ? $responsable->nom_complet : 'Responsable Qualité'
                    ];
                });

            $data = [
                'kpis' => [
                    'taux_conformite' => round($tauxConformite, 1),
                    'tests_totaux' => $totalTests,
                ],
                'performance' => $performanceData,
                'critical_alerts' => $criticalAlerts,
                'team_stats' => $teamStats,
                'date' => now()->format('d/m/Y H:i')
            ];

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.dashboard_analytics', $data)
                ->setPaper('a4', 'portrait');

            return $pdf->download('RAPPORT_ANALYTIQUE_AEROTECH_' . now()->format('Ymd') . '.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur génération PDF',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
