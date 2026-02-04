<?php

namespace App\Services;

use App\Models\TestIndustriel;
use App\Models\Mesure;
use App\Enums\TestStatutEnum;
use App\Enums\TestResultatEnum;
use App\Enums\EquipementStatutEnum;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TestIndustrielService
{
    /**
     * Créer un nouveau test
     */
    public function creerTest(array $data): TestIndustriel
    {
        // Le numero_test sera généré automatiquement via le boot() du model
        $test = TestIndustriel::create($data);
        
        // Génération automatique des lignes de mesures à partir de la checklist dès la création (planification)
        $test->load(['typeTest.checklistsControle.items', 'instrument']);
        $checklist = $test->typeTest->checklistsControle->first();
        if ($checklist && $checklist->items->count() > 0) {
            foreach ($checklist->items as $item) {
                \App\Models\Mesure::create([
                    'test_id' => $test->id_test,
                    'instrument_id' => $test->instrument_id,
                    'parametre_mesure' => $item->libelle,
                    'type_mesure' => $item->type_verif ?? 'TECHNIQUE',
                    'valeur_reference' => $item->valeur_reference,
                    'unite_mesure' => $test->instrument?->unite_mesure ?? '',
                    'tolerance_min' => $item->tolerance,
                    'tolerance_max' => $item->tolerance,
                    'conforme' => null, // En attente de saisie
                    'operateur_id' => auth()->id() ?? $test->responsable_test_id,
                    'timestamp_mesure' => now(),
                ]);
            }
        }
        
        return $test->fresh(['mesures', 'instrument']);
    }

    /**
     * Mettre à jour un test existant
     */
    public function modifierTest(string $testId, array $data): TestIndustriel
    {
        $test = TestIndustriel::findOrFail($testId);
        $test->update($data);
        
        return $test->fresh();
    }

    /**
     * Obtenir un test avec ses relations complètes
     */
    public function getTestDetails(string $testId): TestIndustriel
    {
        return TestIndustriel::with([
            'equipement', 
            'typeTest.checklistsControle', 
            'responsable', 
            'createur',
            'instrument', // Relation belongsTo instrument_id
            'mesures',
            'nonConformites'
        ])->findOrFail($testId);
    }

    /**
     * Démarrer un test
     */
    public function demarrerTest(string $testId): TestIndustriel
    {
        $test = TestIndustriel::with(['typeTest.checklistsControle.items', 'instrument'])->findOrFail($testId);
        
        if ($test->statut_test !== TestStatutEnum::PLANIFIE) {
            throw new \Exception("Le test doit être en statut 'Planifié' pour être démarré.");
        }

        // Sécurité temporelle industrielle : Verrouillage si avant l'heure prévue
        // Uniquement si une heure de début planifiée existe
        if ($test->heure_debut_planifiee) {
            $dateStr = $test->date_test instanceof \DateTime ? $test->date_test->format('Y-m-d') : $test->date_test;
            $planStart = Carbon::parse($dateStr . ' ' . $test->heure_debut_planifiee);
            
            // Tolérance de 1 minute (60 secondes) pour absorber les décalages de synchro client/serveur
            if (Carbon::now()->addMinute()->lessThan($planStart)) {
                $diff = Carbon::now()->diffForHumans($planStart, ['parts' => 3, 'join' => true]);
                throw new \Exception("Verrouillage de sécurité : Ce test ne peut démarrer que dans " . $diff . ".");
            }
        }
        
        // Sécurité : Si aucune mesure n'a été générée à la création, on tente de les générer maintenant
        if ($test->mesures()->count() === 0) {
            $checklist = $test->typeTest->checklistsControle->first();
            // Si une checklist existe, on génère les mesures, sinon on laisse le test démarrer vide
            if ($checklist && $checklist->items->count() > 0) {
                foreach ($checklist->items as $item) {
                    \App\Models\Mesure::create([
                        'test_id' => $test->id_test,
                        'instrument_id' => $test->instrument_id,
                        'parametre_mesure' => $item->libelle,
                        'type_mesure' => $item->type_verif ?? 'TECHNIQUE',
                        'valeur_reference' => $item->valeur_reference,
                        'unite_mesure' => $test->instrument?->unite_mesure ?? '',
                        'tolerance_min' => $item->tolerance,
                        'tolerance_max' => $item->tolerance,
                        'conforme' => null,
                        'operateur_id' => auth()->id() ?? $test->responsable_test_id,
                        'timestamp_mesure' => now(),
                    ]);
                }
            }
        }
        
        $test->demarrer();
        
        return $test->fresh(['mesures', 'instrument']);
    }

    /**
     * Terminer un test avec calculs automatiques
     */
    public function terminerTest(string $testId): TestIndustriel
    {
        $test = TestIndustriel::findOrFail($testId);
        
        if ($test->statut_test !== TestStatutEnum::EN_COURS) {
            throw new \Exception("Le test doit être 'En cours' pour être terminé.");
        }
        
        $test->terminer(); // Logique dans le model
        
        return $test->fresh();
    }

    /**
     * Obtenir les tests en cours
     */
    public function getTestsEnCours(): Collection
    {
        return TestIndustriel::enCours()
            ->with(['equipement', 'typeTest', 'responsable'])
            ->orderBy('date_test', 'desc')
            ->get();
    }

    /**
     * Supprimer un test et ses données liées
     */
    public function deleteTest(string $testId): bool
    {
        $test = TestIndustriel::findOrFail($testId);
        
        // Nettoyage des données liées (HasMany)
        // Ces tables existent et sont liées par test_id
        $test->mesures()->delete();
        $test->resultats()->delete();
        $test->observations()->delete();
        $test->sessions()->delete();
        $test->rapports()->delete();
        $test->nonConformites()->delete();
        
        // Les relations pivot (belongsToMany) comme 'instruments' ou 'normes'
        // sont ignorées car leurs tables de liaison n'existent pas encore en base.
        
        return $test->delete();
    }

    /**
     * Obtenir tous les tests avec pagination et filtres
     */
    public function getPaginatedTests(array $filters = [], $user = null): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = TestIndustriel::query()
            ->with(['equipement', 'typeTest', 'responsable'])
            ->orderBy('created_at', 'desc');

        // Filtrage par Rôle (Sécurité de données)
        if ($user && $user->personnel && $user->personnel->role) {
            $role = $user->personnel->role->nom_role;
            $personnelId = $user->id_personnel;

            if ($role === 'Technicien') {
                $query->where(function($q) use ($personnelId) {
                    $q->where('responsable_test_id', $personnelId)
                      ->orWhere('created_by', $personnelId)
                      ->orWhereJsonContains('equipe_test', $personnelId);
                });
            }
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('numero_test', 'like', "%{$search}%")
                  ->orWhereHas('equipement', function ($qe) use ($search) {
                      $qe->where('designation', 'like', "%{$search}%")
                        ->orWhere('code_equipement', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut_test', $filters['statut']);
        }

        if (!empty($filters['equipement_id'])) {
            $query->where('equipement_id', $filters['equipement_id']);
        }

        if (!empty($filters['type_test_id'])) {
            $query->where('type_test_id', $filters['type_test_id']);
        }

        if (!empty($filters['date_debut']) && !empty($filters['date_fin'])) {
            $query->whereBetween('date_test', [$filters['date_debut'], $filters['date_fin']]);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    /**
     * Obtenir les tests non conformes d'une période
     */
    public function getTestsNonConformes(Carbon $dateDebut, Carbon $dateFin): Collection
    {
        return TestIndustriel::nonConformes()
            ->parPeriode($dateDebut, $dateFin)
            ->with(['equipement', 'nonConformites'])
            ->get();
    }

    /**
     * Statistiques tests par équipement
     */
    public function statistiquesParEquipement(string $equipementId, Carbon $dateDebut, Carbon $dateFin): array
    {
        $tests = TestIndustriel::parEquipement($equipementId)
            ->parPeriode($dateDebut, $dateFin)
            ->get();

        $total = $tests->count();
        $conformes = $tests->where('resultat_global', TestResultatEnum::CONFORME)->count();
        $nonConformes = $tests->where('resultat_global', TestResultatEnum::NON_CONFORME)->count();
        $partiels = $tests->where('resultat_global', TestResultatEnum::PARTIEL)->count();

        return [
            'total_tests' => $total,
            'conformes' => $conformes,
            'non_conformes' => $nonConformes,
            'partiels' => $partiels,
            'taux_conformite' => $total > 0 ? round(($conformes / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Générer rapport de synthèse test
     */
    public function genererRapportSynthese(string $testId): array
    {
        $test = TestIndustriel::with([
            'equipement',
            'typeTest',
            'responsable',
            'mesures',
            'resultats',
            'observations',
            'nonConformites'
        ])->findOrFail($testId);

        return [
            'test' => $test,
            'synthese' => [
                'nombre_mesures' => $test->mesures->count(),
                'mesures_conformes' => $test->mesures->where('conforme', true)->count(),
                'nombre_nc' => $test->nonConformites->count(),
                'duree_effective' => $test->duree_reelle_heures,
                'taux_conformite' => $test->taux_conformite_pct,
            ]
        ];
    }

    /**
     * Obtenir les statistiques globales pour le dashboard
     */
    public function getGlobalStats(): array
    {
        // 1. Statistiques de base
        $totalTests = TestIndustriel::count();
        $testsEnCours = TestIndustriel::where('statut_test', TestStatutEnum::EN_COURS)->count();
        $ncOuvertes = \App\Models\NonConformite::where('statut', 'OUVERTE')->count();
        $ncCritiques = \App\Models\NonConformite::whereHas('criticite', function($q) {
            $q->where('code_niveau', 'NC3')->orWhere('code_niveau', 'NC4');
        })->count();

        // 2. Évolution industrielle (6 derniers mois)
        $evolutionData = [];
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->translatedFormat('M'); // Pour avoir "janv.", "févr.", etc.
            $months[] = $monthName;
            
            $evolutionData['tests'][] = TestIndustriel::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)->count();
            
            $evolutionData['conformes'][] = TestIndustriel::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->where('resultat_global', TestResultatEnum::CONFORME)->count();

            $evolutionData['nc'][] = \App\Models\NonConformite::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)->count();
        }

        // 3. Répartition des NC par statut
        $ncDist = \App\Models\NonConformite::selectRaw('statut, count(*) as count')
            ->groupBy('statut')
            ->pluck('count', 'statut')
            ->toArray();

        // 4. Derniers tests et NC pour les listes du dashboard
        $recentTests = TestIndustriel::with('equipement')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentNc = \App\Models\NonConformite::with(['criticite', 'equipement'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return [
            'totalTests' => $totalTests,
            'testsEnCours' => $testsEnCours,
            'ncOuvertes' => $ncOuvertes,
            'ncCritiques' => $ncCritiques,
            'tauxConformite' => $totalTests > 0 ? (float) round((TestIndustriel::where('resultat_global', TestResultatEnum::CONFORME)->count() / $totalTests) * 100, 1) : 0,
            'industrial_evolution' => [
                'series' => [
                    ['name' => 'Tests Réalisés', 'type' => 'column', 'data' => $evolutionData['tests']],
                    ['name' => 'Tests Conformes', 'type' => 'area', 'data' => $evolutionData['conformes']],
                    ['name' => 'Non-Conformités', 'type' => 'line', 'data' => $evolutionData['nc']],
                ],
                'categories' => $months
            ],
            'nc_distribution' => [
                'series' => array_values($ncDist),
                'labels' => array_keys($ncDist)
            ],
            'recent_tests' => $recentTests,
            'recent_nc' => $recentNc
        ];
    }
    /**
     * Obtenir les statistiques spécifiques pour un technicien
     */
    public function getTechnicianStats(string $personnelId): array
    {
        $assignedTests = TestIndustriel::where('responsable_test_id', $personnelId)
            ->where('statut_test', TestStatutEnum::PLANIFIE)
            ->count();
            
        $inProgressTests = TestIndustriel::where('responsable_test_id', $personnelId)
            ->where('statut_test', TestStatutEnum::EN_COURS)
            ->count();
            
        $completedTests = TestIndustriel::where('responsable_test_id', $personnelId)
            ->where('statut_test', TestStatutEnum::TERMINE)
            ->count();

        $recentTests = TestIndustriel::with(['equipement', 'typeTest'])
            ->where('responsable_test_id', $personnelId)
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();

        $assignedTestsList = TestIndustriel::with(['equipement', 'typeTest'])
            ->where('responsable_test_id', $personnelId)
            ->whereIn('statut_test', [TestStatutEnum::PLANIFIE, TestStatutEnum::EN_COURS])
            ->orderBy('date_test', 'asc')
            ->get();

        return [
            'assignedCount' => $assignedTests,
            'inProgressCount' => $inProgressTests,
            'completedCount' => $completedTests,
            'recent_tests' => $recentTests,
            'assignedTests' => $assignedTestsList,
        ];

    }

    /**
     * Obtenir les données nécessaires pour la création d'un test
     */
    public function getCreationData(): array
    {
        $personnels = \App\Models\Personnel::select('id_personnel', 'nom', 'prenom', 'fonction')->get();
        
        // Fallback pour le développement si la table personnels est vide
        if ($personnels->isEmpty()) {
            $personnels = \App\Models\User::all()->map(function($user) {
                return [
                    'id_personnel' => $user->id, // On simule l'ID
                    'nom' => $user->name,
                    'prenom' => '',
                    'fonction' => 'Utilisateur',
                ];
            });
        }

        // Récupérer l'utilisateur connecté avec ses informations complètes
        $currentUser = auth()->user();
        $currentUserData = null;
        
        if ($currentUser) {
            // Si l'utilisateur a un personnel associé
            if ($currentUser->personnel) {
                $currentUserData = [
                    'id' => $currentUser->id,
                    'id_personnel' => $currentUser->personnel->id_personnel,
                    'nom' => $currentUser->personnel->nom,
                    'prenom' => $currentUser->personnel->prenom,
                    'fonction' => $currentUser->personnel->fonction ?? 'Responsable',
                    'role' => $currentUser->personnel->role->nom_role ?? 'Ingénieur',
                ];
            } else {
                // Sinon, utiliser les données de base de l'utilisateur
                $currentUserData = [
                    'id' => $currentUser->id,
                    'id_personnel' => $currentUser->id,
                    'nom' => $currentUser->name,
                    'prenom' => '',
                    'fonction' => 'Workflow Manager',
                    'role' => 'Ingénieur',
                ];
            }
        }

        return [
            'equipements' => \App\Models\Equipement::select('id_equipement', 'designation', 'code_equipement', 'localisation_site')->get(),
            'types_tests' => \App\Models\TypeTest::select('id_type_test', 'libelle', 'code_type', 'description', 'frequence_recommandee', 'niveau_criticite_defaut', 'equipements_eligibles', 'actif')->orderBy('libelle')->get(),
            'instruments' => \App\Models\InstrumentMesure::select('id_instrument', 'designation', 'numero_serie', 'type_instrument', 'statut')->orderBy('designation')->get(),
            'phases' => \App\Models\PhaseTest::select('id_phase', 'nom_phase')->orderBy('ordre_execution')->get(),
            'personnels' => $personnels,
            'procedures' => \App\Models\ProcedureTest::select('id_procedure', 'code_procedure', 'titre')->orderBy('code_procedure')->get(),
            'current_user' => $currentUserData,
        ];
    }

    public function getCalendarTests(int $month = null, int $year = null): Collection
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        return TestIndustriel::whereMonth('date_test', $month)
            ->whereYear('date_test', $year)
            ->with(['equipement', 'typeTest', 'responsable'])
            ->orderBy('date_test', 'asc')
            ->get();
    }
}
