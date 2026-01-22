<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Poste;

class PosteController extends Controller
{
    /**
     * Get all active postes
     */
    public function index()
    {
        $postes = Poste::actifs()
            ->orderBy('categorie')
            ->orderBy('libelle')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $postes
        ]);
    }
}
