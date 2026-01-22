<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeders Référentiels
        $this->call([
            \Database\Seeders\Referential\NiveauCriticiteSeeder::class,
            \Database\Seeders\Referential\PhaseTestSeeder::class,
            \Database\Seeders\Referential\TypeTestSeeder::class,
            \Database\Seeders\Referential\NormeSeeder::class,
            
            // Equipements
            \Database\Seeders\EquipementSeeder::class,
            
            // Référentiels RH
            \Database\Seeders\Referential\PosteSeeder::class,
            \Database\Seeders\Referential\DepartementSeeder::class,
            
            // RBAC
            \Database\Seeders\RolesAndPermissionsSeeder::class,
            
            // Utilisateurs
            \Database\Seeders\UserSeeder::class,
            
            // Personnel (correspondant aux utilisateurs)
            \Database\Seeders\PersonnelSeeder::class,
            
            // Données test
            \Database\Seeders\TestsIndustrielsSeeder::class,
        ]);
    }
}
