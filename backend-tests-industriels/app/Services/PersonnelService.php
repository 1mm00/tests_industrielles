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
        $personnel = Personnel::with('role')->whereNotNull('departement')->get();
        $grouped = $personnel->groupBy('departement');

        $byDepartement = [];
        foreach ($grouped as $deptName => $users) {
            $byDepartement[] = [
                'departement' => $deptName,
                'count' => $users->count(),
                'users' => $users
            ];
        }

        return [
            'total' => Personnel::count(),
            'actifs' => Personnel::where('actif', true)->count(),
            'inactifs' => Personnel::where('actif', false)->count(),
            'by_departement' => $byDepartement,
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
