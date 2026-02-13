<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\VerificationEfficaciteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationEfficaciteController extends Controller
{
    protected $verificationService;

    public function __construct(VerificationEfficaciteService $verificationService)
    {
        $this->verificationService = $verificationService;
    }

    /**
     * Enregistrer une nouvelle vérification
     * POST /api/v1/verifications-efficacite
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action_corrective_id' => 'required|uuid|exists:actions_correctives,id_action',
            'methode_verification' => 'required|string',
            'resultats_constates' => 'required|string',
            'est_efficace' => 'required|boolean',
            'date_verification' => 'nullable|date',
            'commentaires' => 'nullable|string',
        ]);

        $verification = $this->verificationService->enregistrerVerification(
            $validated,
            $request->user()->id_personnel
        );

        return response()->json([
            'success' => true,
            'message' => 'Vérification d\'efficacité enregistrée avec succès',
            'data' => $verification
        ], 201);
    }

    /**
     * Liste des vérifications pour une NC
     * GET /api/v1/non-conformites/{ncId}/verifications
     */
    public function indexParNc(string $ncId): JsonResponse
    {
        $verifications = $this->verificationService->getVerificationsParNc($ncId);

        return response()->json([
            'success' => true,
            'data' => $verifications
        ]);
    }
}
