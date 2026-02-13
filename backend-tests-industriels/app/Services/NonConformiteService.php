<?php

namespace App\Services;

use App\Models\NonConformite;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class NonConformiteService
{
    /**
     * Obtenir toutes les non-conformités avec pagination et filtres
     */
    public function getPaginatedNc(array $filters = [], $user = null): LengthAwarePaginator
    {
        $query = NonConformite::query()
            ->with(['test', 'equipement', 'criticite', 'causesRacines', 'planAction'])
            ->orderBy('created_at', 'desc');

        // Filtrage par Rôle (Sécurité de données)
        if ($user && $user->personnel && $user->personnel->role) {
            $role = $user->personnel->role->nom_role;
            $personnelId = $user->id_personnel;

            if ($role === 'Technicien') {
                $query->where(function($q) use ($personnelId) {
                    $q->where('detecteur_id', $personnelId)
                      ->orWhereHas('test', function($qt) use ($personnelId) {
                          $qt->where('responsable_test_id', $personnelId)
                            ->orWhereJsonContains('equipe_test', $personnelId);
                      });
                });
            }
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('numero_nc', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        if (!empty($filters['criticite_id'])) {
            $query->where('criticite_id', $filters['criticite_id']);
        }

        if (!empty($filters['equipement_id'])) {
            $query->where('equipement_id', $filters['equipement_id']);
        }

        if (isset($filters['is_archived'])) {
            $query->where('is_archived', filter_var($filters['is_archived'], FILTER_VALIDATE_BOOLEAN));
        } else {
            $query->where('is_archived', false);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    /**
     * Obtenir les statistiques détaillées des NC
     */
    public function getNcStats(): array
    {
        return [
            'summary' => [
                'total' => NonConformite::count(),
                'ouvertes' => NonConformite::where('statut', 'OUVERTE')->count(),
                'en_cours' => NonConformite::where('statut', 'TRAITEMENT')->count(),
                'cloturees' => NonConformite::where('statut', 'CLOTUREE')->count(),
            ],
            'by_status' => NonConformite::selectRaw('statut, count(*) as count')
                ->groupBy('statut')
                ->get(),
            'by_type' => NonConformite::selectRaw('type_nc, count(*) as count')
                ->groupBy('type_nc')
                ->orderBy('count', 'desc')
                ->take(5)
                ->get(),
            'by_criticite' => NonConformite::selectRaw('criticite_id, count(*) as count')
                ->with('criticite')
                ->groupBy('criticite_id')
                ->get()
                ->map(function ($item) {
                    return [
                        'label' => $item->criticite ? $item->criticite->code_niveau : 'Inconnu',
                        'count' => $item->count,
                        'color' => $item->criticite ? $item->criticite->couleur_indicateur : '#94a3b8'
                    ];
                }),
            'recent_trends' => NonConformite::selectRaw('DATE(date_detection) as date, count(*) as count')
                ->where('date_detection', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get(),
            'quality_kpis' => [
                'taux_efficacite' => $this->calculerTauxEfficacite(),
                'delai_moyen_resolution' => $this->calculerDelaiMoyenResolution(),
            ]
        ];
    }

    /**
     * Calculer le taux d'efficacité des actions correctives vérifiées
     */
    private function calculerTauxEfficacite(): float
    {
        $totalVerif = \App\Models\VerificationEfficacite::count();
        if ($totalVerif === 0) return 0;

        $efficaces = \App\Models\VerificationEfficacite::where('est_efficace', true)->count();
        return round(($efficaces / $totalVerif) * 100, 1);
    }

    /**
     * Calculer le délai moyen de résolution (entre détection et clôture) en jours
     */
    private function calculerDelaiMoyenResolution(): float
    {
        $ncCloturees = NonConformite::whereNotNull('date_cloture')
            ->whereNotNull('date_detection')
            ->get();

        if ($ncCloturees->isEmpty()) return 0;

        $totalJours = $ncCloturees->reduce(function ($carry, $nc) {
            $detection = \Carbon\Carbon::parse($nc->date_detection);
            $cloture = \Carbon\Carbon::parse($nc->date_cloture);
            return $carry + $detection->diffInDays($cloture);
        }, 0);

        return round($totalJours / $ncCloturees->count(), 1);
    }

    /**
     * Créer une nouvelle non-conformité
     */
    public function creerNc(array $data): NonConformite
    {
        // Génération du numéro NC si non fourni
        if (empty($data['numero_nc'])) {
            $prefix = 'NC-' . now()->format('Ymd');
            $count = NonConformite::where('numero_nc', 'like', "{$prefix}%")->count();
            $data['numero_nc'] = $prefix . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
        }

        $data['statut'] = $data['statut'] ?? 'OUVERTE';
        $data['date_detection'] = $data['date_detection'] ?? now();

        return NonConformite::create($data);
    }

    /**
     * Mettre à jour une non-conformité existante
     */
    public function updateNc(string $id, array $data): NonConformite
    {
        $nc = NonConformite::findOrFail($id);
        
        if ($nc->statut === 'CLOTUREE') {
            throw new \Exception("Modification impossible : cette NC est clôturée et verrouillée.");
        }

        $nc->update($data);
        return $nc->fresh(['test', 'equipement', 'criticite']);
    }

    /**
     * Supprimer une non-conformité
     */
    public function deleteNc(string $id, $user = null): bool
    {
        $nc = NonConformite::findOrFail($id);

        $roleName = $user->personnel->role->nom_role ?? '';
        $isAdmin = str_contains(strtolower($roleName), 'admin');

        if ($nc->statut === 'CLOTUREE' && !$isAdmin) {
            throw new \Exception("Suppression impossible : cette NC est clôturée. Seul un administrateur peut supprimer une NC clôturée.");
        }

        // 1. Supprimer les causes racines
        $nc->causesRacines()->delete();
        
        // 2. Supprimer les plans d'actions et leurs actions/vérifications
        $plan = $nc->planAction;
        if ($plan) {
            $actionIds = \App\Models\ActionCorrective::where('plan_id', $plan->id_plan)->pluck('id_action');
            
            // Supprimer les vérifications d'efficacité liées aux actions
            \App\Models\VerificationEfficacite::whereIn('action_corrective_id', $actionIds)->delete();
            
            // Supprimer les actions
            \App\Models\ActionCorrective::where('plan_id', $plan->id_plan)->delete();
            
            // Supprimer le plan
            $plan->delete();
        }

        // 3. Sécurité : Supprimer les actions orphelines liées directement à la NC
        $orphanActionIds = \App\Models\ActionCorrective::where('non_conformite_id', $id)->pluck('id_action');
        \App\Models\VerificationEfficacite::whereIn('action_corrective_id', $orphanActionIds)->delete();
        \App\Models\ActionCorrective::where('non_conformite_id', $id)->delete();

        return $nc->delete();
    }

    /**
     * Archiver/Désarchiver une non-conformité
     */
    public function archiveNc(string $id): NonConformite
    {
        $nc = NonConformite::findOrFail($id);
        
        $nc->update([
            'is_archived' => !$nc->is_archived
        ]);

        return $nc->fresh(['causesRacines', 'planAction.actions', 'test', 'equipement']);
    }

    /**
     * Enregistrer l'analyse des causes racines
     */
    public function analyserNc(string $id, array $data): NonConformite
    {
        $nc = NonConformite::findOrFail($id);
        
        if ($nc->statut === 'CLOTUREE') {
            throw new \Exception("Action impossible : la NC est déjà clôturée.");
        }

        // Supprimer les anciennes causes si besoin ou mettre à jour
        $nc->causesRacines()->delete();

        foreach ($data['causes_racines'] as $causeData) {
            \App\Models\CauseRacine::create([
                'non_conformite_id' => $id,
                'categorie' => $causeData['categorie'],
                'description' => $causeData['description'],
                'type_cause' => $causeData['categorie'],
                'probabilite_recurrence_pct' => $causeData['probabilite'] === 'FAIBLE' ? 25 : ($causeData['probabilite'] === 'POSSIBLE' ? 50 : ($causeData['probabilite'] === 'PROBABLE' ? 75 : 100)),
            ]);
        }

        $nc->update([
            'conclusions' => $data['conclusions'] ?? null,
            'statut' => 'TRAITEMENT'
        ]);

        return $nc->fresh(['causesRacines']);
    }

    /**
     * Créer un plan d'actions
     */
    public function createPlanAction(string $id, array $data): \App\Models\PlanAction
    {
        $nc = NonConformite::findOrFail($id);

        if ($nc->statut === 'CLOTUREE') {
            throw new \Exception("Action impossible : le plan d'actions d'une NC clôturée ne peut plus être modifié.");
        }

        // 1. Gérer le Plan d'Action
        $numeroPlan = 'PLAN-' . $nc->numero_nc;
        $existingPlan = \App\Models\PlanAction::where('non_conformite_id', $id)->first();

        $plan = \App\Models\PlanAction::updateOrCreate(
            ['non_conformite_id' => $id],
            [
                'numero_plan' => $numeroPlan,
                'responsable_plan_id' => $data['responsable_id'],
                'date_creation' => $existingPlan->date_creation ?? now(),
                'date_echeance' => $data['date_echeance'],
                'objectifs' => $data['objectifs'] ?? null,
                'statut_plan' => 'ACTIF',
            ]
        );

        // 2. Synchroniser les Actions (Upsert logic pour protéger l'historique)
        $actionIdsToKeep = [];

        foreach ($data['actions'] as $index => $actionData) {
            $numeroAction = $nc->numero_nc . '-AC-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);
            
            // On cherche par ID (si fourni) ou par numéro unique d'action
            $action = \App\Models\ActionCorrective::updateOrCreate(
                [
                    'id_action' => $actionData['id_action'] ?? \Illuminate\Support\Str::uuid(),
                    'plan_id' => $plan->id_plan
                ],
                [
                    'non_conformite_id' => $id,
                    'numero_action' => $numeroAction,
                    'type_action' => $actionData['type_action'],
                    'description' => $actionData['description'],
                    'responsable_id' => $actionData['responsable_id'],
                    'date_prevue' => $actionData['date_prevue'],
                    'statut' => $actionData['statut'] ?? 'A_FAIRE',
                ]
            );

            $actionIdsToKeep[] = $action->id_action;
        }

        // 3. Nettoyer les actions qui ont été supprimées
        \App\Models\ActionCorrective::where('plan_id', $plan->id_plan)
            ->whereNotIn('id_action', $actionIdsToKeep)
            ->delete();

        $nc->update(['statut' => 'TRAITEMENT']);

        return $plan->load('actions');
    }

    /**
     * Clôturer définitivement une non-conformité
     */
    public function cloturerNc(string $id, array $data, $valideurId): NonConformite
    {
        $nc = NonConformite::findOrFail($id);

        if ($nc->statut === 'CLOTUREE') {
            throw new \Exception("Cette non-conformité est déjà clôturée.");
        }

        $plan = $nc->planAction;
        if (!$plan) {
            throw new \Exception("Clôture impossible : aucun plan d'actions n'a été défini pour cette NC.");
        }

        // Vérification du statut de TOUTES les actions du plan
        // On considère qu'une action est terminée si son statut est 'TERMINEE' ou 'REALISEE'
        $actionsNonTerminees = \App\Models\ActionCorrective::where('plan_id', $plan->id_plan)
            ->whereNotIn('statut', ['TERMINEE', 'REALISEE', 'FAITE'])
            ->count();

        if ($actionsNonTerminees > 0) {
            throw new \Exception("Clôture refusée : il reste {$actionsNonTerminees} action(s) non terminée(s) dans le plan.");
        }

        // Verrouillage de la NC
        $nc->update([
            'statut' => 'CLOTUREE',
            'date_cloture' => now(),
            'valideur_cloture_id' => $valideurId,
            'commentaires_cloture' => $data['commentaires_cloture'] ?? 'Clôture automatique après vérification des actions.',
        ]);

        return $nc->fresh(['planAction.actions', 'test', 'equipement']);
    }

    /**
     * Obtenir les données pour la création d'une NC
     */
    public function getCreationData(): array
    {
        return [
            'equipements' => \App\Models\Equipement::select('id_equipement', 'designation', 'code_equipement', 'localisation_site', 'localisation_precise')->get(),
            'criticites' => \App\Models\NiveauCriticite::select('id_niveau_criticite', 'code_niveau', 'libelle')->orderBy('ordre_affichage')->get(),
            'personnels' => \App\Models\Personnel::select('id_personnel', 'nom', 'prenom')->get(),
            'tests' => \App\Models\TestIndustriel::select('id_test', 'numero_test')->orderBy('created_at', 'desc')->limit(50)->get(),
        ];
    }

    /**
     * Réouvrir une NC clôturée (cas de récidive ou efficacité insuffisante)
     */
    public function reouvrirNc(string $id, array $data, $userId): NonConformite
    {
        $nc = NonConformite::findOrFail($id);

        if ($nc->statut !== 'CLOTUREE') {
            throw new \Exception("Seule une fiche clôturée peut être réouverte.");
        }

        $nc->update([
            'statut' => 'TRAITEMENT',
            'date_cloture' => null, // On efface la date de clôture
            'motif_reouverture' => $data['motif_reouverture'],
            'date_reouverture' => now(),
            'reouverte_par_id' => $userId,
        ]);

        return $nc->fresh(['planAction.actions', 'test', 'equipement']);
    }
}
