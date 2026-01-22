<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class PersonnelController extends Controller
{
    /**
     * Store a newly created personnel and user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule' => 'required|string|unique:personnels,matricule',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:personnels,email|unique:users,email',
            'telephone' => 'nullable|string|max:50',
            'poste' => 'required|string|max:255',
            'departement' => 'nullable|string|max:255',
            'role_id' => 'nullable|uuid|exists:roles,id_role',
            'date_embauche' => 'nullable|date',
            'actif' => 'boolean',
        ]);

        // Créer le dossier Personnel
        $personnel = Personnel::create(array_merge($validated, [
            'id_personnel' => Str::uuid()->toString(),
            'actif' => $validated['actif'] ?? true,
        ]));

        // Créer le compte User correspondant
        $user = User::create([
            'name' => trim($validated['prenom'] . ' ' . $validated['nom']),
            'email' => $validated['email'],
            'password' => Hash::make('password'), // Mot de passe par défaut
            'id_personnel' => $personnel->id_personnel,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Personnel et utilisateur créés avec succès',
            'data' => $personnel->load('role')
        ], 201);
    }

    /**
     * Update the specified personnel and associated user
     */
    public function update(Request $request, $id)
    {
        $personnel = Personnel::findOrFail($id);
        
        $validated = $request->validate([
            'matricule' => 'required|string|unique:personnels,matricule,'.$id.',id_personnel',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:personnels,email,'.$id.',id_personnel',
            'telephone' => 'nullable|string|max:50',
            'poste' => 'required|string|max:255',
            'departement' => 'nullable|string|max:255',
            'role_id' => 'nullable|uuid|exists:roles,id_role',
            'date_embauche' => 'nullable|date',
            'actif' => 'boolean',
        ]);

        $personnel->update($validated);

        // Mettre à jour le compte User correspondant s'il existe
        $user = User::where('id_personnel', $id)->first();
        if ($user) {
            $user->update([
                'name' => trim($validated['prenom'] . ' ' . $validated['nom']),
                'email' => $validated['email'],
                // On ne touche pas au mot de passe ici
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Personnel et utilisateur mis à jour avec succès',
            'data' => $personnel->load('role')
        ], 200);
    }

    /**
     * Remove the specified personnel and associated user
     */
    public function destroy($id)
    {
        $personnel = Personnel::findOrFail($id);
        
        // Supprimer l'utilisateur associé d'abord
        User::where('id_personnel', $id)->delete();
        
        // Supprimer le personnel
        $personnel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Personnel et utilisateur supprimés avec succès'
        ], 200);
    }
}
