<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Role;

class RoleController extends Controller
{
    /**
     * Get all roles
     */
    public function index()
    {
        $roles = Role::all();
        
        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }
}
