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
            ->with(['test', 'equipement', 'criticite'])
            ->orderBy('created_at', 'desc');

        // Filtrage par Rôle (Sécurité de données)
        if ($user && $user->personnel && $user->personnel->role) {
            $role = $user->personnel->role->nom_role;
            $personnelId = $user->id_personnel;

            if (in_array($role, ['Technicien', 'Lecteur'])) {
                $query->where(function($q) use ($personnelId) {
                    $q->where('detectee_par_id', $personnelId)
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
                'en_cours' => NonConformite::where('statut', 'EN_COURS')->count(),
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
        ];
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
        $nc->update($data);
        return $nc->fresh(['test', 'equipement', 'criticite']);
    }

    /**
     * Supprimer une non-conformité
     */
    public function deleteNc(string $id): bool
    {
        $nc = NonConformite::findOrFail($id);
        return $nc->delete();
    }

    /**
     * Obtenir les données pour la création d'une NC
     */
    public function getCreationData(): array
    {
        return [
            'equipements' => \App\Models\Equipement::select('id_equipement', 'designation', 'code_equipement')->get(),
            'criticites' => \App\Models\NiveauCriticite::select('id_niveau_criticite', 'code_niveau', 'libelle')->orderBy('ordre_affichage')->get(),
            'personnels' => \App\Models\Personnel::select('id_personnel', 'nom', 'prenom')->get(),
            'tests' => \App\Models\TestIndustriel::select('id_test', 'numero_test')->orderBy('created_at', 'desc')->limit(50)->get(),
        ];
    }
}
