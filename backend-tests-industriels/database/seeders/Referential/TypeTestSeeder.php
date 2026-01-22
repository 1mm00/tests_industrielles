<?php

namespace Database\Seeders\Referential;

use Illuminate\Database\Seeder;
use App\Models\TypeTest;
use Illuminate\Support\Str;

class TypeTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'code_type' => 'REG-ELEC',
                'libelle' => 'Inspection Réglementaire Électrique',
                'categorie_principale' => 'Obligatoire',
                'sous_categorie' => 'Électricité',
                'description' => 'Vérification de conformité aux normes NFC 15-100',
                'niveau_criticite_defaut' => 4,
                'duree_estimee_jours' => 1.5,
                'frequence_recommandee' => 'Annuel',
                'actif' => true,
            ],
            [
                'code_type' => 'PERF-MEC',
                'libelle' => 'Test de Performance Mécanique',
                'categorie_principale' => 'Standard',
                'sous_categorie' => 'Mécanique',
                'description' => 'Test de rendement et de vibration des machines tournantes',
                'niveau_criticite_defaut' => 2,
                'duree_estimee_jours' => 0.5,
                'frequence_recommandee' => 'Semestriel',
                'actif' => true,
            ],
            [
                'code_type' => 'QUAL-MAT',
                'libelle' => 'Contrôle Qualité Matières',
                'categorie_principale' => 'Standard',
                'sous_categorie' => 'Qualité',
                'description' => 'Analyse chimique et structurelle des matériaux entrants',
                'niveau_criticite_defaut' => 3,
                'duree_estimee_jours' => 2.0,
                'frequence_recommandee' => 'Par lot',
                'actif' => true,
            ],
            [
                'code_type' => 'SEC-ATEX',
                'libelle' => 'Audit Sécurité Zone ATEX',
                'categorie_principale' => 'Obligatoire',
                'sous_categorie' => 'Sécurité',
                'description' => 'Vérification des équipements en zone explosible',
                'niveau_criticite_defaut' => 4,
                'duree_estimee_jours' => 1.0,
                'frequence_recommandee' => 'Trimestriel',
                'actif' => true,
            ],
            [
                'code_type' => 'THERMO-IR',
                'libelle' => 'Thermographie Infrarouge',
                'categorie_principale' => 'Standard',
                'sous_categorie' => 'Maintenance',
                'description' => 'Détection de points chauds sur armoires électriques',
                'niveau_criticite_defaut' => 2,
                'duree_estimee_jours' => 0.25,
                'frequence_recommandee' => 'Mensuel',
                'actif' => true,
            ],
        ];

        foreach ($types as $type) {
            TypeTest::firstOrCreate(
                ['code_type' => $type['code_type']],
                array_merge($type, [
                    'id_type_test' => Str::uuid()->toString()
                ])
            );
        }

        if ($this->command) {
            $this->command->info('✅ ' . count($types) . ' types de tests créés');
        }
    }
}
