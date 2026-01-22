<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SystemService;
use Illuminate\Http\JsonResponse;

class SystemController extends Controller
{
    protected $systemService;

    public function __construct(SystemService $systemService)
    {
        $this->systemService = $systemService;
    }

    /**
     * GET /api/v1/system/health
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->systemService->getSystemHealth()
        ]);
    }

    /**
     * GET /api/v1/system/notifications
     */
    public function notifications(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->systemService->getNotifications()
        ]);
    }
}
