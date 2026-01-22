<?php

namespace App\Services;

use App\Models\TestIndustriel;
use App\Models\NonConformite;
use App\Models\InstrumentMesure;
use Illuminate\Support\Facades\DB;

class SystemService
{
    /**
     * Obtenir l'état de santé du système
     */
    public function getSystemHealth(): array
    {
        $dbStatus = 'ONLINE';
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $dbStatus = 'OFFLINE';
        }

        return [
            'status' => $dbStatus === 'ONLINE' ? 'OK' : 'CRITICAL',
            'components' => [
                'database' => $dbStatus,
                'api' => 'ONLINE',
                'storage' => 'ONLINE',
                'latency' => round(microtime(true) - LARAVEL_START, 4) . 's'
            ],
            'last_sync' => now()->toDateTimeString()
        ];
    }

    /**
     * Récupérer les notifications consolidées pour le Navbar
     */
    public function getNotifications(): array
    {
        $notifications = [];

        // 1. Tests en attente ou critiques
        $pendingTests = TestIndustriel::whereIn('statut_test', ['PLANIFIE', 'Planifié'])
            ->orderBy('date_test', 'asc')
            ->limit(3)
            ->get();

        foreach ($pendingTests as $test) {
            $notifications[] = [
                'id' => 'test-' . $test->id_test,
                'title' => 'Test en attente',
                'description' => "Le test {$test->numero_test} est planifié pour le {$test->date_test}.",
                'type' => 'info',
                'category' => 'tests',
                'time' => $test->created_at ? $test->created_at->diffForHumans() : 'Récemment'
            ];
        }

        // 2. Non-conformités ouvertes (CRITIQUES)
        // On suppose que la criticité >= 3 est critique (ou via la table NiveauCriticite)
        $criticalNcs = NonConformite::whereIn('statut', ['OUVERTE', 'Ouvert'])
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($criticalNcs as $nc) {
            $notifications[] = [
                'id' => 'nc-' . $nc->id_non_conformite,
                'title' => 'NC détectée',
                'description' => "{$nc->numero_nc}: " . substr($nc->description, 0, 50) . "...",
                'type' => 'error',
                'category' => 'quality',
                'time' => $nc->created_at ? $nc->created_at->diffForHumans() : 'Récemment'
            ];
        }

        // 3. Instruments nécessitant calibration
        $overdueInstruments = InstrumentMesure::where('date_prochaine_calibration', '<=', now())
            ->limit(2)
            ->get();

        foreach ($overdueInstruments as $inst) {
            $notifications[] = [
                'id' => 'inst-' . ($inst->id_instrument ?? $inst->id),
                'title' => 'Calibration requise',
                'description' => "L'instrument {$inst->code_instrument} a expiré.",
                'type' => 'warning',
                'category' => 'maintenance',
                'time' => 'Aujourd\'hui'
            ];
        }

        return $notifications;
    }
}
