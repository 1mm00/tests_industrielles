<?php

namespace App\Services;

use App\Models\TestIndustriel;
use App\Models\NonConformite;
use App\Models\Equipement;
use App\Models\Mesure;
use App\Enums\TestStatutEnum;
use App\Enums\TestResultatEnum;
use App\Enums\EquipementStatutEnum;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class KpiService
{
    /**
     * Récupérer les KPIs du dashboard
     */
    public function getDashboardKpis(array $filters = [])
    {
        $startDate = $filters['start_date'] ?? Carbon::now()->subMonth();
        $endDate = $filters['end_date'] ?? Carbon::now();

        return [
            'taux_reussite' => $this->calculateTauxReussite($startDate, $endDate),
            'total_tests' => $this->getTotalTests($startDate, $endDate),
            'tests_par_statut' => $this->getTestsParStatut($startDate, $endDate),
            'non_conformites' => $this->getNonConformitesStats($startDate, $endDate),
            'temps_moyen_execution' => $this->getTempsMoyenExecution($startDate, $endDate),
            'taux_utilisation_equipements' => $this->getTauxUtilisationEquipements($startDate, $endDate),
            'performance_par_type' => $this->getPerformanceParType($startDate, $endDate),
            'tendances' => $this->getTendances($startDate, $endDate),
        ];
    }

    /**
     * Calcul du taux de réussite global
     */
    public function calculateTauxReussite($startDate, $endDate)
    {
        $query = TestIndustriel::whereBetween('date_test', [$startDate, $endDate])
            ->where('statut_test', TestStatutEnum::TERMINE);

        $total = $query->count();
        
        if ($total === 0) {
            return [
                'valeur' => 0,
                'total' => 0,
                'reussis' => 0,
                'variation' => 0,
            ];
        }

        $reussis = TestIndustriel::whereBetween('date_test', [$startDate, $endDate])
            ->where('statut_test', TestStatutEnum::TERMINE)
            ->where('resultat_global', TestResultatEnum::CONFORME)
            ->count();

        $taux = ($reussis / $total) * 100;

        // Calcul de la variation par rapport à la période précédente
        $previousPeriod = $this->getPreviousPeriodTauxReussite($startDate, $endDate);
        $variation = $taux - $previousPeriod;

        return [
            'valeur' => round($taux, 2),
            'total' => $total,
            'reussis' => $reussis,
            'variation' => round($variation, 2),
        ];
    }

    /**
     * Total des tests sur la période
     */
    public function getTotalTests($startDate, $endDate)
    {
        $total = TestIndustriel::whereBetween('date_test', [$startDate, $endDate])
            ->count();

        $previousTotal = $this->getPreviousPeriodTotal($startDate, $endDate);
        $variation = $total - $previousTotal;

        return [
            'valeur' => $total,
            'variation' => $variation,
            'variation_pct' => $previousTotal > 0 ? round(($variation / $previousTotal) * 100, 2) : 0,
        ];
    }

    /**
     * Nombre de tests par statut
     */
    public function getTestsParStatut($startDate, $endDate)
    {
        return TestIndustriel::whereBetween('date_test', [$startDate, $endDate])
            ->select('statut_test', DB::raw('count(*) as count'))
            ->groupBy('statut_test')
            ->get()
            ->mapWithKeys(function ($item) {
                $key = $item->statut_test instanceof \UnitEnum ? $item->statut_test->value : $item->statut_test;
                return [$key => $item->count];
            });
    }

    /**
     * Statistiques des non-conformités
     */
    public function getNonConformitesStats($startDate, $endDate)
    {
        $total = NonConformite::whereBetween('date_detection', [$startDate, $endDate])
            ->count();

        $ouvertes = NonConformite::whereBetween('date_detection', [$startDate, $endDate])
            ->where('statut', 'OUVERTE')
            ->count();

        $critiques = NonConformite::whereBetween('date_detection', [$startDate, $endDate])
            ->whereHas('criticite', function ($query) {
                $query->where('code_niveau', 'CRITIQUE');
            })
            ->count();

        $previousTotal = $this->getPreviousPeriodNonConformites($startDate, $endDate);
        $variation = $total - $previousTotal;

        return [
            'total' => $total,
            'ouvertes' => $ouvertes,
            'critiques' => $critiques,
            'variation' => $variation,
            'taux_ouverture' => $total > 0 ? round(($ouvertes / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Temps moyen d'exécution des tests
     */
    public function getTempsMoyenExecution($startDate, $endDate)
    {
        $tests = TestIndustriel::whereBetween('date_test', [$startDate, $endDate])
            ->whereNotNull('heure_debut')
            ->whereNotNull('heure_fin')
            ->get();

        if ($tests->isEmpty()) {
            return [
                'valeur' => 0,
                'unite' => 'heures',
                'variation' => 0,
            ];
        }

        $totalHeures = $tests->sum(function ($test) {
            $debut = Carbon::parse($test->heure_debut);
            $fin = Carbon::parse($test->heure_fin);
            return $debut->diffInHours($fin);
        });

        $moyenne = $totalHeures / $tests->count();

        return [
            'valeur' => round($moyenne, 2),
            'unite' => 'heures',
            'variation' => 0, // TODO: calculer par rapport à période précédente
        ];
    }

    /**
     * Taux d'utilisation des équipements
     */
    public function getTauxUtilisationEquipements($startDate, $endDate)
    {
        $totalEquipements = Equipement::where('statut_operationnel', EquipementStatutEnum::EN_SERVICE)->count();
        
        $equipementsUtilises = TestIndustriel::whereBetween('date_test', [$startDate, $endDate])
            ->distinct('equipement_id')
            ->count('equipement_id');

        $taux = $totalEquipements > 0 ? ($equipementsUtilises / $totalEquipements) * 100 : 0;

        return [
            'valeur' => round($taux, 2),
            'equipements_utilises' => $equipementsUtilises,
            'total_equipements' => $totalEquipements,
        ];
    }

    /**
     * Performance par type de test
     */
    public function getPerformanceParType($startDate, $endDate)
    {
        return TestIndustriel::whereBetween('date_test', [$startDate, $endDate])
            ->join('types_tests', 'tests_industriels.type_test_id', '=', 'types_tests.id_type_test')
            ->select(
                'types_tests.libelle',
                DB::raw('count(*) as total'),
                DB::raw('sum(case when tests_industriels.resultat_global = \'CONFORME\' then 1 else 0 end) as valides')
            )
            ->groupBy('types_tests.id_type_test', 'types_tests.libelle')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->libelle,
                    'total' => $item->total,
                    'valides' => $item->valides,
                    'taux_reussite' => $item->total > 0 ? round(($item->valides / $item->total) * 100, 2) : 0,
                ];
            });
    }

    /**
     * Tendances (évolution mensuelle)
     */
    public function getTendances($startDate, $endDate)
    {
        $tests = TestIndustriel::whereBetween('date_test', [$startDate, $endDate])
            ->select(
                DB::raw("TO_CHAR(date_test, 'YYYY-MM') as mois"),
                DB::raw('count(*) as total'),
                DB::raw('sum(case when resultat_global = \'CONFORME\' then 1 else 0 end) as valides')
            )
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        return $tests->map(function ($item) {
            return [
                'mois' => $item->mois,
                'total' => $item->total,
                'valides' => $item->valides,
                'taux_reussite' => $item->total > 0 ? round(($item->valides / $item->total) * 100, 2) : 0,
            ];
        });
    }

    /**
     * Helpers pour calcul des variations
     */
    private function getPreviousPeriodTauxReussite($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $duration = $start->diffInDays($end);

        $previousStart = $start->copy()->subDays($duration);
        $previousEnd = $start->copy()->subDay();

        $result = $this->calculateTauxReussite($previousStart, $previousEnd);
        return $result['valeur'];
    }

    private function getPreviousPeriodTotal($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $duration = $start->diffInDays($end);

        $previousStart = $start->copy()->subDays($duration);
        $previousEnd = $start->copy()->subDay();

        return TestIndustriel::whereBetween('date_test', [$previousStart, $previousEnd])
            ->count();
    }

    private function getPreviousPeriodNonConformites($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $duration = $start->diffInDays($end);

        $previousStart = $start->copy()->subDays($duration);
        $previousEnd = $start->copy()->subDay();

        return NonConformite::whereBetween('date_detection', [$previousStart, $previousEnd])
            ->count();
    }
}
