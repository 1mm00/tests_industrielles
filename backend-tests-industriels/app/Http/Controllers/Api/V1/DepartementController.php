<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Departement;

class DepartementController extends Controller
{
    /**
     * Get all active departements
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $departements = Departement::actifs()
            ->forRole($request->role_id)
            ->forPoste($request->poste)
            ->orderBy('categorie')
            ->orderBy('libelle')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $departements
        ]);
    }
}
