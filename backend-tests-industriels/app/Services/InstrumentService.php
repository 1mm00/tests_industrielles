<?php

namespace App\Services;

use App\Models\InstrumentMesure;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Enums\InstrumentStatutEnum;

class InstrumentService
{
    /**
     * Obtenir tous les instruments avec pagination et filtres
     */
    public function getPaginatedInstruments(array $filters = []): LengthAwarePaginator
    {
        $query = InstrumentMesure::query()
            ->orderBy('code_instrument', 'asc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code_instrument', 'like', "%{$search}%")
                  ->orWhere('designation', 'like', "%{$search}%")
                  ->orWhere('fabricant', 'like', "%{$search}%")
                  ->orWhere('modele', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        if (!empty($filters['type'])) {
            $query->where('type_instrument', $filters['type']);
        }

        if (!empty($filters['calibration_filter'])) {
            if ($filters['calibration_filter'] === 'expired') {
                $query->where('date_prochaine_calibration', '<', now());
            } elseif ($filters['calibration_filter'] === 'upcoming') {
                $query->whereBetween('date_prochaine_calibration', [now(), now()->addDays(30)]);
            }
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    /**
     * Obtenir les statistiques des instruments
     */
    public function getInstrumentStats(): array
    {
        return [
            'total' => InstrumentMesure::count(),
            'operationnels' => InstrumentMesure::where('statut', InstrumentStatutEnum::OPERATIONNEL)->count(),
            'en_calibration' => InstrumentMesure::where('statut', InstrumentStatutEnum::EN_CALIBRATION)->count(),
            'hors_service' => InstrumentMesure::where('statut', InstrumentStatutEnum::HORS_SERVICE)->count(),
            'calibration_echue' => InstrumentMesure::where('date_prochaine_calibration', '<', now())
                ->whereIn('statut', [InstrumentStatutEnum::OPERATIONNEL])->count(),
            'calibration_proche' => InstrumentMesure::whereBetween('date_prochaine_calibration', [now(), now()->addDays(30)])
                ->whereIn('statut', [InstrumentStatutEnum::OPERATIONNEL])->count(),
        ];
    }

    public function getCalibrationAlertsDetailed(): array
    {
        return [
            'expired' => InstrumentMesure::where('date_prochaine_calibration', '<', now())
                ->where('statut', InstrumentStatutEnum::OPERATIONNEL)
                ->orderBy('date_prochaine_calibration', 'asc')
                ->get(),
            'upcoming' => InstrumentMesure::whereBetween('date_prochaine_calibration', [now(), now()->addDays(30)])
                ->where('statut', InstrumentStatutEnum::OPERATIONNEL)
                ->orderBy('date_prochaine_calibration', 'asc')
                ->get(),
        ];
    }

    /**
     * Créer un nouvel instrument
     */
    public function createInstrument(array $data): InstrumentMesure
    {
        // Calculer la prochaine calibration si non fournie
        if (empty($data['date_prochaine_calibration']) && !empty($data['date_derniere_calibration']) && !empty($data['periodicite_calibration_mois'])) {
            $data['date_prochaine_calibration'] = \Carbon\Carbon::parse($data['date_derniere_calibration'])
                ->addMonths((int)$data['periodicite_calibration_mois']);
        }
        
        return InstrumentMesure::create($data);
    }
}
