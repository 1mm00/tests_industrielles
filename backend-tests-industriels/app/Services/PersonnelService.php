<?php

namespace App\Services;

use App\Models\Personnel;
use Illuminate\Database\Eloquent\Collection;

class PersonnelService
{
    /**
     * Liste de tout le personnel
     */
    public function getAllPersonnel(): Collection
    {
        return Personnel::orderBy('nom', 'asc')->get();
    }

    /**
     * Obtenir les statistiques du personnel pour le dashboard
     */
    public function getPersonnelStats(): array
    {
        return [
            'total' => Personnel::count(),
            'actifs' => Personnel::where('actif', true)->count(),
            'inactifs' => Personnel::where('actif', false)->count(),
            'by_departement' => Personnel::selectRaw('departement, count(*) as count')
                ->whereNotNull('departement')
                ->groupBy('departement')
                ->get(),
        ];
    }

    /**
     * Créer un nouveau membre du personnel
     */
    public function createPersonnel(array $data): Personnel
    {
        return Personnel::create($data);
    }
}
