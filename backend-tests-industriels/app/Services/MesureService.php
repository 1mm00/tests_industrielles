<?php

namespace App\Services;

use App\Models\Mesure;
use App\Models\TestIndustriel;
use App\Models\SessionTest;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class MesureService
{
    public function getMesuresParTest(string $testId): Collection
    {
        return Mesure::where('test_id', $testId)
            ->with(['instrument', 'operateur'])
            ->get();
    }

    public function ajouterMesure(array $data): Mesure
    {
        // Auto-remplir l'instrument_id depuis le test si non fourni
        if (empty($data['instrument_id']) && !empty($data['test_id'])) {
            $test = TestIndustriel::find($data['test_id']);
            if ($test && $test->instrument_id) {
                $data['instrument_id'] = $test->instrument_id;
            }
        }

        // Calculer la conformité si possible
        if (isset($data['valeur_mesuree']) && isset($data['valeur_reference'])) {
            $val = (float) $data['valeur_mesuree'];
            $ref = (float) $data['valeur_reference'];
            $tolMin = (float) ($data['tolerance_min'] ?? 0);
            $tolMax = (float) ($data['tolerance_max'] ?? 0);

            $data['ecart_absolu'] = $val - $ref;
            $data['ecart_pct'] = $ref != 0 ? ($data['ecart_absolu'] / $ref) * 100 : 0;
            
            // Logique de conformité simple
            if ($tolMin != 0 || $tolMax != 0) {
                $data['conforme'] = ($val >= ($ref - $tolMin)) && ($val <= ($ref + $tolMax));
            } else {
                $data['conforme'] = abs($data['ecart_absolu']) < 0.0001; // Égalité approximative
            }
        }

        if (empty($data['id_mesure'])) {
            $data['id_mesure'] = Str::uuid()->toString();
        }

        $mesure = Mesure::create($data);

        // Auto-start le test s'il est au statut PLANIFIE
        $test = TestIndustriel::find($data['test_id']);
        if ($test && $test->statut_test === \App\Enums\TestStatutEnum::PLANIFIE) {
            $test->demarrer();
        }

        return $mesure;
    }

    public function updateMesure(string $id, array $data): Mesure
    {
        $mesure = Mesure::findOrFail($id);
        
        // Recalculer si les valeurs changent
        if (isset($data['valeur_mesuree']) || isset($data['valeur_reference'])) {
            $val = (float) ($data['valeur_mesuree'] ?? $mesure->valeur_mesuree);
            $ref = (float) ($data['valeur_reference'] ?? $mesure->valeur_reference);
            $tolMin = (float) ($data['tolerance_min'] ?? $mesure->tolerance_min);
            $tolMax = (float) ($data['tolerance_max'] ?? $mesure->tolerance_max);

            $data['ecart_absolu'] = $val - $ref;
            $data['ecart_pct'] = $ref != 0 ? ($data['ecart_absolu'] / $ref) * 100 : 0;
            
            if ($tolMin != 0 || $tolMax != 0) {
                $data['conforme'] = ($val >= ($ref - $tolMin)) && ($val <= ($ref + $tolMax));
            } else {
                $data['conforme'] = abs($data['ecart_absolu']) < 0.0001;
            }
        }

        $mesure->update($data);
        return $mesure->fresh();
    }

    public function supprimerMesure(string $id): bool
    {
        $mesure = Mesure::findOrFail($id);
        return $mesure->delete();
    }
}
