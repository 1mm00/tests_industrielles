<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Personnel;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Création des 4 rôles
        $roles = [
            [
                'nom_role' => 'Admin',
                'description' => 'Administrateur système - Accès complet',
                'niveau_acces' => 4,
                'permissions' => json_encode([
                    'tests' => ['create', 'read', 'update', 'delete', 'execute'],
                    'mesures' => ['create', 'read', 'update', 'delete'],
                    'non_conformites' => ['create', 'read', 'update', 'delete', 'close'],
                    'rapports' => ['create', 'read', 'export'],
                    'personnel' => ['create', 'read', 'update', 'delete'],
                    'equipements' => ['create', 'read', 'update', 'delete'],
                ]),
            ],
            [
                'nom_role' => 'Ingénieur',
                'description' => 'Ingénieur - Création et gestion des tests',
                'niveau_acces' => 3,
                'permissions' => json_encode([
                    'tests' => ['create', 'read', 'update', 'execute'],
                    'mesures' => ['create', 'read', 'update'],
                    'non_conformites' => ['create', 'read', 'update', 'close'],
                    'rapports' => ['create', 'read', 'export'],
                    'equipements' => ['read', 'update'],
                ]),
            ],
            [
                'nom_role' => 'Technicien',
                'description' => 'Technicien - Exécution des tests et saisie mesures',
                'niveau_acces' => 2,
                'permissions' => json_encode([
                    'tests' => ['read', 'execute'],
                    'mesures' => ['create', 'read'],
                    'non_conformites' => ['create', 'read'],
                    'rapports' => ['read'],
                    'equipements' => ['read'],
                ]),
            ],
            [
                'nom_role' => 'Lecteur',
                'description' => 'Lecteur - Consultation uniquement',
                'niveau_acces' => 1,
                'permissions' => json_encode([
                    'tests' => ['read'],
                    'mesures' => ['read'],
                    'non_conformites' => ['read'],
                    'rapports' => ['read'],
                    'equipements' => ['read'],
                ]),
            ],
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(
                ['nom_role' => $roleData['nom_role']],
                array_merge($roleData, [
                    'id_role' => Str::uuid()->toString(),
                    'actif' => true,
                ])
            );
        }

        $this->command->info('✅ 4 rôles RBAC créés: Admin, Ingénieur, Technicien, Lecteur');
    }
}
