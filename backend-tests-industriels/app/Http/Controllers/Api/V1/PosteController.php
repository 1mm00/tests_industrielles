<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Poste;
use Illuminate\Http\Request;

class PosteController extends Controller
{
    /**
     * Get all active postes, optionally filtered by role
     */
    public function index(Request $request)
    {
        $postes = Poste::actifs()
            ->forRole($request->role_id)
            ->orderBy('categorie')
            ->orderBy('libelle')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $postes
        ]);
    }
}
