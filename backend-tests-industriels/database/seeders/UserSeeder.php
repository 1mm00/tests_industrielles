<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Utilisateur Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@tests.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        
        // Utilisateur Ingénieur
        User::create([
            'name' => 'Ingénieur Test',
            'email' => 'ingenieur@tests.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        
        // Utilisateur Technicien
        User::create([
            'name' => 'Technicien Test',
            'email' => 'technicien@tests.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        
        // Utilisateur Lecteur
        User::create([
            'name' => 'Lecteur Test',
            'email' => 'lecteur@tests.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        
        $this->command->info('✅ 4 utilisateurs de test créés');
        $this->command->info('   Note: Les personnels seront créés par PersonnelSeeder');
    }
}
