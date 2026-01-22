<?php

namespace App\Services;

use App\Models\Equipement;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Enums\EquipementStatutEnum;

class EquipementService
{
    /**
     * Obtenir tous les équipements avec pagination et filtres
     */
    public function getPaginatedEquipements(array $filters = []): LengthAwarePaginator
    {
        $query = Equipement::query()
            ->with(['responsable', 'proprietaire'])
            ->orderBy('code_equipement', 'asc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code_equipement', 'like', "%{$search}%")
                  ->orWhere('designation', 'like', "%{$search}%")
                  ->orWhere('fabricant', 'like', "%{$search}%")
                  ->orWhere('modele', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut_operationnel', $filters['statut']);
        }

        if (!empty($filters['criticite'])) {
            $query->where('niveau_criticite', $filters['criticite']);
        }

        if (!empty($filters['site'])) {
            $query->where('localisation_site', 'like', "%{$filters['site']}%");
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    /**
     * Obtenir les statistiques des équipements
     */
    public function getEquipementStats(): array
    {
        return [
            'total' => Equipement::count(),
            'en_service' => Equipement::where('statut_operationnel', EquipementStatutEnum::EN_SERVICE)->count(),
            'en_maintenance' => Equipement::where('statut_operationnel', EquipementStatutEnum::MAINTENANCE)->count(),
            'hors_service' => Equipement::where('statut_operationnel', EquipementStatutEnum::HORS_SERVICE)->count(),
            'critiques' => Equipement::where('niveau_criticite', '>=', 3)->count(),
        ];
    }
}
