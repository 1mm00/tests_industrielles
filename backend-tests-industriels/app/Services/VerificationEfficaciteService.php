<?php

namespace App\Services;

use App\Models\ActionCorrective;
use App\Models\VerificationEfficacite;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VerificationEfficaciteService
{
    /**
     * Enregistrer une vérification d'efficacité pour une action
     */
    public function enregistrerVerification(array $data, string $verificateurId): VerificationEfficacite
    {
        return DB::transaction(function () use ($data, $verificateurId) {
            $action = ActionCorrective::findOrFail($data['action_corrective_id']);

            // Créer la vérification
            $verification = VerificationEfficacite::create([
                'action_corrective_id' => $action->id_action,
                'verificateur_id' => $verificateurId,
                'date_verification' => $data['date_verification'] ?? now(),
                'methode_verification' => $data['methode_verification'],
                'resultats_constates' => $data['resultats_constates'],
                'est_efficace' => $data['est_efficace'],
                'commentaires' => $data['commentaires'] ?? null,
            ]);

            // Mettre à jour le statut de l'action si nécessaire
            // Si c'est efficace, l'action est vraiment "VALIDÉE"
            if ($data['est_efficace']) {
                $action->update(['statut' => 'TERMINEE']);
            } else {
                // Si pas efficace, on pourrait réouvrir l'action ou en créer une nouvelle
                $action->update(['statut' => 'A_REVOIR']);
            }

            return $verification->load(['actionCorrective', 'verificateur']);
        });
    }

    /**
     * Récupérer les vérifications pour une NC spécifique via son plan d'action
     */
    public function getVerificationsParNc(string $ncId)
    {
        return VerificationEfficacite::whereHas('actionCorrective.planAction', function ($query) use ($ncId) {
            $query->where('non_conformite_id', $ncId);
        })->with(['actionCorrective', 'verificateur'])->get();
    }
}
