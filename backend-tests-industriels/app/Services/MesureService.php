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
        $test = TestIndustriel::findOrFail($data['test_id']);

        if ($test->est_verrouille) {
            throw new \Exception("Verrouillage de sécurité : Impossible d'ajouter des mesures à un test verrouillé.");
        }

        // Auto-remplir l'instrument_id depuis le test si non fourni
        if (empty($data['instrument_id']) && !empty($data['test_id'])) {
            $test = TestIndustriel::find($data['test_id']);
            if ($test && $test->instrument_id) {
                $data['instrument_id'] = $test->instrument_id;
            }
        }

        // Calculer la conformité et les écarts métrologiques
        if (isset($data['valeur_mesuree']) && isset($data['valeur_reference'])) {
            $val = round((float) $data['valeur_mesuree'], 6);
            $ref = round((float) $data['valeur_reference'], 6);
            $tolMin = round((float) ($data['tolerance_min'] ?? 0), 6);
            $tolMax = round((float) ($data['tolerance_max'] ?? 0), 6);

            $data['ecart_absolu'] = round($val - $ref, 6);
            $data['ecart_pct'] = $ref != 0 ? round(($data['ecart_absolu'] / $ref) * 100, 4) : 0;
            
            // Logique de conformité industrielle certifiée
            if ($tolMin > 0 || $tolMax > 0) {
                // Inclusion des bornes (>= et <=)
                $minAcceptable = round($ref - $tolMin, 6);
                $maxAcceptable = round($ref + $tolMax, 6);
                $data['conforme'] = ($val >= $minAcceptable) && ($val <= $maxAcceptable);
            } else {
                // Si pas de tolérance, égalité stricte (avec marge d'erreur infinitésimale)
                $data['conforme'] = abs($data['ecart_absolu']) < 0.000001;
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
        $mesure = Mesure::with('test')->findOrFail($id);

        if ($mesure->test && $mesure->test->est_verrouille) {
            throw new \Exception("Intégrité des données : Les mesures d'un test verrouillé ne peuvent plus être modifiées.");
        }
        
        // Recalculer si les valeurs changent
        if (isset($data['valeur_mesuree']) || isset($data['valeur_reference']) || isset($data['tolerance_min']) || isset($data['tolerance_max'])) {
            $val = round((float) ($data['valeur_mesuree'] ?? $mesure->valeur_mesuree), 6);
            $ref = round((float) ($data['valeur_reference'] ?? $mesure->valeur_reference), 6);
            $tolMin = round((float) ($data['tolerance_min'] ?? $mesure->tolerance_min), 6);
            $tolMax = round((float) ($data['tolerance_max'] ?? $mesure->tolerance_max), 6);

            $data['ecart_absolu'] = round($val - $ref, 6);
            $data['ecart_pct'] = $ref != 0 ? round(($data['ecart_absolu'] / $ref) * 100, 4) : 0;
            
            if ($tolMin > 0 || $tolMax > 0) {
                $minAcceptable = round($ref - $tolMin, 6);
                $maxAcceptable = round($ref + $tolMax, 6);
                $data['conforme'] = ($val >= $minAcceptable) && ($val <= $maxAcceptable);
            } else {
                $data['conforme'] = abs($data['ecart_absolu']) < 0.000001;
            }
        }

        $mesure->update($data);
        return $mesure->fresh();
    }

    public function supprimerMesure(string $id): bool
    {
        $mesure = Mesure::with('test')->findOrFail($id);

        if ($mesure->test && $mesure->test->est_verrouille) {
            throw new \Exception("Alerte de sécurité : Impossible de supprimer une mesure d'archive verrouillée.");
        }

        return $mesure->delete();
    }
}
