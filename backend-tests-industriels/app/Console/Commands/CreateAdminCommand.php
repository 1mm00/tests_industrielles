<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Personnel;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAdminCommand extends Command
{
    protected $signature = 'create:admin {email} {password} {nom} {prenom}';
    protected $description = 'Créer un administrateur';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        $nom = $this->argument('nom');
        $prenom = $this->argument('prenom');

        $adminRole = Role::where('nom_role', 'Admin')->first();

        if (!$adminRole) {
            $this->error("Le rôle 'Admin' n'existe pas.");
            return;
        }

        $personnel = Personnel::create([
            'id_personnel' => (string) Str::uuid(),
            'matricule' => 'ADMIN-' . strtoupper(Str::random(5)),
            'nom' => $nom,
            'prenom' => $prenom,
            'email' => $email,
            'poste' => 'Administrateur Système',
            'departement' => 'Direction',
            'role_id' => $adminRole->id_role,
            'actif' => true,
        ]);

        $user = User::create([
            'name' => $nom . ' ' . $prenom,
            'email' => $email,
            'password' => Hash::make($password),
            'id_personnel' => $personnel->id_personnel,
        ]);

        $this->info("Administrateur créé avec succès : " . $email);
    }
}
