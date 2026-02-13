<?php

namespace App\Services;

use App\Models\Maintenance;
use App\Models\Equipement;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MaintenanceService
{
    /**
     * Liste paginée des interventions
     */
    public function getPaginatedMaintenances(array $filters = [])
    {
        $query = Maintenance::with(['equipement', 'technicien'])
            ->orderBy('date_prevue', 'desc');

        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['equipement_id'])) {
            $query->where('equipement_id', $filters['equipement_id']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Planifier une nouvelle intervention
     */
    public function planifierMaintenance(array $data)
    {
        $data['id_maintenance'] = (string) Str::uuid();
        $data['numero_intervention'] = $this->generateInterventionNumber();
        $data['statut'] = 'PLANIFIEE';

        return Maintenance::create($data);
    }

    /**
     * Enregistrer la réalisation d'une maintenance
     */
    public function terminerMaintenance(string $id, array $data)
    {
        $maintenance = Maintenance::findOrFail($id);

        $maintenance->update([
            'statut' => 'REALISEE',
            'date_realisation' => $data['date_realisation'] ?? Carbon::now(),
            'rapport_technique' => $data['rapport_technique'] ?? null,
            'cout_reel' => $data['cout_reel'] ?? null,
            'pieces_changees' => $data['pieces_changees'] ?? null,
            'technicien_id' => $data['technicien_id'] ?? $maintenance->technicien_id,
        ]);

        // Si c'est une maintenance préventive avec périodicité, planifier la suivante
        if ($maintenance->type === 'PREVENTIVE' && $maintenance->periodicite_jours > 0) {
            $this->planifierProchaineOccurence($maintenance);
        }

        return $maintenance;
    }

    /**
     * Générer un numéro d'intervention unique
     */
    private function generateInterventionNumber()
    {
        $prefix = 'MNT-' . date('Ymd');
        $count = Maintenance::where('numero_intervention', 'like', $prefix . '%')->count();
        return $prefix . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Planifier automatiquement la prochaine maintenance préventive
     */
    private function planifierProchaineOccurence(Maintenance $lastMaintenance)
    {
        $nextDate = Carbon::parse($lastMaintenance->date_realisation)
            ->addDays($lastMaintenance->periodicite_jours);

        return Maintenance::create([
            'id_maintenance' => (string) Str::uuid(),
            'numero_intervention' => $this->generateInterventionNumber(),
            'equipement_id' => $lastMaintenance->equipement_id,
            'titre' => $lastMaintenance->titre,
            'description' => $lastMaintenance->description,
            'type' => 'PREVENTIVE',
            'priorite' => $lastMaintenance->priorite,
            'date_prevue' => $nextDate,
            'periodicite_jours' => $lastMaintenance->periodicite_jours,
            'statut' => 'PLANIFIEE',
        ]);
    }

    /**
     * Statistiques de maintenance
     */
    public function getStats()
    {
        return [
            'total' => Maintenance::count(),
            'a_faire' => Maintenance::whereIn('statut', ['PLANIFIEE', 'EN_COURS'])->count(),
            'retard' => Maintenance::whereIn('statut', ['PLANIFIEE', 'EN_COURS'])
                ->where('date_prevue', '<', Carbon::now())
                ->count(),
            'realisees_mois' => Maintenance::where('statut', 'REALISEE')
                ->whereMonth('date_realisation', Carbon::now()->month)
                ->count(),
            'cout_total_mois' => Maintenance::whereMonth('date_realisation', Carbon::now()->month)
                ->sum('cout_reel'),
        ];
    }
}
