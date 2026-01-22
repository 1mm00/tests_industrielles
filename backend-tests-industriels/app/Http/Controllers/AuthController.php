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
        
        // Charger la relation personnel si elle existe
        $user->load('personnel');
        
        // Récupérer le personnel via la relation ou par email
        $personnel = $user->personnel ?? \App\Models\Personnel::where('email', $user->email)->first();
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'personnel' => $personnel
            ]
        ]);
    }
}
