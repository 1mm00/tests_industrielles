<?php

namespace App\Services;

use App\Models\Mesure;
use App\Models\TestIndustriel;
use Illuminate\Support\Collection;

class MesureService
{
    /**
     * Créer une nouvelle mesure
     * Note: Les calculs (écart, conformité) sont automatiques via MesureObserver
     */
    public function creerMesure(array $data): Mesure
    {
        return Mesure::create($data);
    }

    /**
     * Créer plusieurs mesures en batch
     */
    public function creerMesuresBatch(array $mesuresData): Collection
    {
        $mesures = collect();
        
        foreach ($mesuresData as $data) {
            $mesures->push($this->creerMesure($data));
        }
        
        return $mesures;
    }

    /**
     * Obtenir les mesures non conformes d'un test
     */
    public function getMesuresNonConformes(string $testId): Collection
    {
        return Mesure::parTest($testId)
            ->nonConformes()
            ->with(['instrument', 'operateur'])
            ->get();
    }

    /**
     * Calculer statistiques mesures pour un test
     */
    public function statistiquesMesures(string $testId): array
    {
        $mesures = Mesure::parTest($testId)->get();
        
        $total = $mesures->count();
        $conformes = $mesures->where('conforme', true)->count();
        $nonConformes = $mesures->where('conforme', false)->count();
        
        // Calcul écarts moyens
        $ecartAbsoluMoyen = $mesures->avg('ecart_absolu');
        $ecartPctMoyen = $mesures->avg('ecart_pct');
        
        return [
            'total_mesures' => $total,
            'mesures_conformes' => $conformes,
            'mesures_non_conformes' => $nonConformes,
            'taux_conformite' => $total > 0 ? round(($conformes / $total) * 100, 2) : 0,
            'ecart_absolu_moyen' => round($ecartAbsoluMoyen ?? 0, 4),
            'ecart_pct_moyen' => round($ecartPctMoyen ?? 0, 2),
        ];
    }

    /**
     * Obtenir la répartition des mesures par type
     */
    public function repartitionParType(string $testId): Collection
    {
        return Mesure::parTest($testId)
            ->select('type_mesure')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(CASE WHEN conforme = true THEN 1 ELSE 0 END) as conformes')
            ->groupBy('type_mesure')
            ->get();
    }

    /**
     * Valider toutes les mesures d'un test
     */
    public function validerMesuresTest(string $testId): array
    {
        $mesures = Mesure::parTest($testId)->get();
        
        $validation = [
            'valide' => true,
            'erreurs' => [],
        ];
        
        foreach ($mesures as $mesure) {
            // Vérifier que les champs obligatoires sont remplis
            if (is_null($mesure->valeur_mesuree)) {
                $validation['valide'] = false;
                $validation['erreurs'][] = "Mesure {$mesure->id_mesure}: valeur_mesuree manquante";
            }
            
            if (is_null($mesure->instrument_id)) {
                $validation['valide'] = false;
                $validation['erreurs'][] = "Mesure {$mesure->id_mesure}: instrument non spécifié";
            }
        }
        
        return $validation;
    }
}
