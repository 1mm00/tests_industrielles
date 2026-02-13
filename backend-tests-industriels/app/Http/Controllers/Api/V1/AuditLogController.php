<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    /**
     * GET /api/v1/audit-logs
     * Liste des logs d'audit avec filtres et pagination (Lecture seule)
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user.personnel')
            ->orderBy('created_at', 'desc');

        // Filtre par événement (created, updated, deleted)
        if ($request->has('event')) {
            $query->where('event', $request->event);
        }

        // Filtre par Type d'entité (NonConformite, TestIndustriel, etc.)
        if ($request->has('type')) {
            $query->where('auditable_type', 'like', '%' . $request->type . '%');
        }

        // Filtre par utilisateur
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Recherche par ID d'entité
        if ($request->has('entity_id')) {
            $query->where('auditable_id', $request->entity_id);
        }

        $perPage = $request->get('per_page', 20);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'meta' => [
                'total' => $logs->total(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
            ]
        ]);
    }

    /**
     * GET /api/v1/audit-logs/{id}
     * Détails d'un log (Lecture seule)
     */
    public function show(string $id): JsonResponse
    {
        $log = AuditLog::with(['user.personnel', 'auditable'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $log
        ]);
    }
}
