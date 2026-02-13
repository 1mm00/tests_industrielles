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
            'cin' => 'required|string|max:20|unique:personnels,cin',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'poste_id' => 'required|uuid|exists:postes,id_poste',
            'departement_id' => 'required|uuid|exists:departements,id_departement',
            'role_id' => 'nullable|uuid|exists:roles,id_role',
            'date_embauche' => 'nullable|date',
            'actif' => 'boolean',
        ]);

        // Générer l'email automatiquement à partir du CIN
        $email = strtolower($validated['cin']) . '@testindustrielle.com';

        // Vérifier que l'email généré n'existe pas déjà
        if (Personnel::where('email', $email)->exists() || User::where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => "L'email généré ($email) existe déjà. Le CIN doit être unique."
            ], 422);
        }

        // Générer le matricule automatiquement
        $matricule = $this->generateMatricule($validated['role_id']);

        // Créer le dossier Personnel
        $personnel = Personnel::create(array_merge($validated, [
            'id_personnel' => Str::uuid()->toString(),
            'matricule' => $matricule,
            'email' => $email,
            'actif' => $validated['actif'] ?? true,
        ]));

        // Créer le compte User correspondant
        $user = User::create([
            'name' => trim($validated['prenom'] . ' ' . $validated['nom']),
            'email' => $email,
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
     * Générer un matricule unique selon le rôle
     */
    private function generateMatricule(?string $roleId): string
    {
        $prefix = 'EMP';
        
        if ($roleId) {
            $role = \App\Models\Role::find($roleId);
            if ($role) {
                switch (strtolower($role->nom_role)) {
                    case 'admin':
                        $prefix = 'ADMIN';
                        break;
                    case 'ingénieur':
                        $prefix = 'ING';
                        break;
                    case 'technicien':
                        $prefix = 'TECH';
                        break;
                    case 'lecteur':
                        $prefix = 'LECT';
                        break;
                }
            }
        }

        // Trouver le dernier numéro utilisé pour ce préfixe
        $lastPersonnel = Personnel::where('matricule', 'LIKE', $prefix . '-%')
            ->orderBy('matricule', 'desc')
            ->first();

        $number = 1;
        if ($lastPersonnel) {
            $parts = explode('-', $lastPersonnel->matricule);
            if (count($parts) === 2 && is_numeric($parts[1])) {
                $number = intval($parts[1]) + 1;
            }
        }

        return $prefix . '-' . str_pad($number, 3, '0', STR_PAD_LEFT);
    }

    public function update(Request $request, $id)
    {
        $personnel = Personnel::findOrFail($id);
        
        $validated = $request->validate([
            'cin' => 'required|string|max:20|unique:personnels,cin,'.$id.',id_personnel',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'poste_id' => 'required|uuid|exists:postes,id_poste',
            'departement_id' => 'required|uuid|exists:departements,id_departement',
            'role_id' => 'nullable|uuid|exists:roles,id_role',
            'date_embauche' => 'nullable|date',
            'actif' => 'boolean',
        ]);

        // Si le CIN a changé, régénérer l'email
        if ($validated['cin'] !== $personnel->cin) {
            $email = strtolower($validated['cin']) . '@testindustrielle.com';
            
            // Vérifier que le nouvel email n'existe pas déjà
            if (Personnel::where('email', $email)->where('id_personnel', '!=', $id)->exists() ||
                User::where('email', $email)->where('id_personnel', '!=', $id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => "L'email généré ($email) existe déjà. Le CIN doit être unique."
                ], 422);
            }
            $validated['email'] = $email;
        }

        $personnel->update($validated);

        // Mettre à jour le compte User correspondant s'il existe
        $user = User::where('id_personnel', $id)->first();
        if ($user && isset($validated['email'])) {
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
