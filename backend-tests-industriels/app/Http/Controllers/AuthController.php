<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Afficher le formulaire de login
     */
    public function showLoginForm()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }
        
        return view('auth.login');
    }
    
    /**
     * Traiter la connexion
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            
            return redirect()->route('dashboard')
                ->with('success', 'Connexion réussie !');
        }
        
        return back()->with('error', 'Email ou mot de passe incorrect.');
    }
    
    /**
     * Afficher le dashboard
     */
    public function dashboard()
    {
        return view('dashboard');
    }
    
    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect()->route('login')
            ->with('success', 'Déconnexion réussie !');
    }
    
    /**
     * API Login - Retourne un token Sanctum
     */
    public function apiLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }
        
        // Charger le personnel et le rôle
        $user->load('personnel.role');
        
        $token = $user->createToken('api-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }
    
    /**
     * API Logout
     */
    public function apiLogout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * API Get Current User Info
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        // Charger le personnel et le rôle
        $user->load('personnel.role');
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'personnel' => $user->personnel
            ]
        ]);
    }

    /**
     * API Update Profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $personnel = $user->personnel;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string|max:20',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($personnel) {
            // Mise à jour de personnels pour la cohérence UI (nom/prénom)
            $nameParts = explode(' ', $validated['name'], 2);
            $nom = $nameParts[0];
            $prenom = $nameParts[1] ?? '';

            $personnel->update([
                'nom' => $nom,
                'prenom' => $prenom,
                'telephone' => $validated['telephone'],
                'email' => $validated['email'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'data' => [
                'user' => $user->fresh('personnel.role'),
                'personnel' => $user->personnel
            ]
        ]);
    }

    /**
     * API Update Password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'L\'ancien mot de passe est incorrect'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }
}
