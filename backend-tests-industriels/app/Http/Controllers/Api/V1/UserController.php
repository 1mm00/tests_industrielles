<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PersonnelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $personnelService;

    public function __construct(PersonnelService $personnelService)
    {
        $this->personnelService = $personnelService;
    }

    /**
     * GET /api/v1/users
     */
    public function index(): JsonResponse
    {
        $users = $this->personnelService->getAllPersonnel();

        return response()->json([
            'success' => true,
            'data' => $users
        ], 200);
    }

    /**
     * GET /api/v1/users/stats
     */
    public function stats(): JsonResponse
    {
        $stats = $this->personnelService->getPersonnelStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }
}
