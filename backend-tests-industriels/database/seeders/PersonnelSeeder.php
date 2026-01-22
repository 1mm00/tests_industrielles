<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Personnel;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Str;

class PersonnelSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer les rôles existants
        $adminRole = Role::where('nom_role', 'Admin')->first();
        $ingenieurRole = Role::where('nom_role', 'Ingénieur')->first();
        $technicienRole = Role::where('nom_role', 'Technicien')->first();
        $lecteurRole = Role::where('nom_role', 'Lecteur')->first();

        // Récupérer les utilisateurs existants
        $adminUser = User::where('email', 'admin@tests.com')->first();
        $ingenieurUser = User::where('email', 'ingenieur@tests.com')->first();
        $technicienUser = User::where('email', 'technicien@tests.com')->first();
        $lecteurUser = User::where('email', 'lecteur@tests.com')->first();

        $personnels = [
            [
                'matricule' => 'ADMIN-001',
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'email' => 'admin@tests.com',
                'telephone' => '+33 6 12 34 56 78',
                'poste' => 'Administrateur Système',
                'departement' => 'DSI',
                'role_id' => $adminRole?->id_role,
                'date_embauche' => '2020-01-15',
                'actif' => true,
                'habilitations' => json_encode(['Admin Système', 'Gestion Qualité', 'Audit ISO']),
            ],
            [
                'matricule' => 'ING-001',
                'nom' => 'Martin',
                'prenom' => 'Sophie',
                'email' => 'ingenieur@tests.com',
                'telephone' => '+33 6 23 45 67 89',
                'poste' => 'Ingénieur Qualité Senior',
                'departement' => 'Qualité Industrielle',
                'role_id' => $ingenieurRole?->id_role,
                'date_embauche' => '2021-03-10',
                'actif' => true,
                'habilitations' => json_encode(['Qualité ISO 9001', 'Tests Industriels', 'Analyse de Performance']),
            ],
            [
                'matricule' => 'TECH-001',
                'nom' => 'Bernard',
                'prenom' => 'Pierre',
                'email' => 'technicien@tests.com',
                'telephone' => '+33 6 34 56 78 90',
                'poste' => 'Technicien de Tests',
                'departement' => 'Bureau d\'Essais',
                'role_id' => $technicienRole?->id_role,
                'date_embauche' => '2022-06-01',
                'actif' => true,
                'habilitations' => json_encode(['Mesures Électriques', 'Essais Mécaniques', 'Sécurité ATEX']),
            ],
            [
                'matricule' => 'LECT-001',
                'nom' => 'Dubois',
                'prenom' => 'Marie',
                'email' => 'lecteur@tests.com',
                'telephone' => '+33 6 45 67 89 01',
                'poste' => 'Responsable Documentation',
                'departement' => 'Documentation Technique',
                'role_id' => $lecteurRole?->id_role,
                'date_embauche' => '2023-02-15',
                'actif' => true,
                'habilitations' => json_encode(['Lecture Documents', 'Archivage']),
            ],
        ];

        foreach ($personnels as $personnelData) {
            $personnel = Personnel::firstOrCreate(
                ['email' => $personnelData['email']],
                array_merge($personnelData, [
                    'id_personnel' => Str::uuid()->toString(),
                ])
            );

            // Lier l'utilisateur avec son personnel
            $user = User::where('email', $personnelData['email'])->first();
            if ($user && $personnel) {
                $user->update(['id_personnel' => $personnel->id_personnel]);
            }
        }

        $this->command->info('✅ 4 personnels créés correspondant aux utilisateurs de test');
        $this->command->info('✅ Utilisateurs mis à jour avec leurs id_personnel');
    }
}
