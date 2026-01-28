<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;


class RoleController extends Controller
{
    /**
     * Get all roles
     */
    public function index()
    {
        $roles = Role::withCount('personnels')->get();
        
        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    /**
     * Update role permissions
     */
    public function updatePermissions(Request $request, string $id)
    {
        $request->validate([
            'permissions' => 'required|array'
        ]);

        $role = Role::findOrFail($id);
        $role->permissions = $request->permissions;
        $role->save();

        return response()->json([
            'success' => true,
            'message' => 'Permissions mises à jour avec succès',
            'data' => $role
        ]);
    }
}

