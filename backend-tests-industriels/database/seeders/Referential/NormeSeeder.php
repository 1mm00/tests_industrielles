<?php

namespace Database\Seeders\Referential;

use Illuminate\Database\Seeder;
use App\Models\Norme;
use Illuminate\Support\Str;
use App\Enums\NormeStatutEnum;

class NormeSeeder extends Seeder
{
    public function run(): void
    {
        $normes = [
            [
                'code_norme' => 'ISO-9001',
                'titre' => 'ISO 9001:2015 - Systèmes de management de la qualité',
                'organisme_emission' => 'ISO',
                'categorie' => 'Qualité',
                'version' => '2015',
                'date_publication' => '2015-09-15',
                'statut' => NormeStatutEnum::ACTIF->value,
                'url_reference' => 'https://www.iso.org/standard/62085.html',
                'description' => 'Norme internationale pour les systèmes de management de la qualité',
            ],
            [
                'code_norme' => 'ISO-17025',
                'titre' => 'ISO/IEC 17025:2017 - Exigences générales pour la compétence des laboratoires',
                'organisme_emission' => 'ISO/IEC',
                'categorie' => 'Laboratoire',
                'version' => '2017',
                'date_publication' => '2017-11-29',
                'statut' => NormeStatutEnum::ACTIF->value,
                'url_reference' => 'https://www.iso.org/standard/66912.html',
                'description' => 'Exigences générales concernant la compétence des laboratoires d\'étalonnage et d\'essais',
            ],
            [
                'code_norme' => 'ISO-45001',
                'titre' => 'ISO 45001:2018 - Systèmes de management de la santé et de la sécurité au travail',
                'organisme_emission' => 'ISO',
                'categorie' => 'Sécurité',
                'version' => '2018',
                'date_publication' => '2018-03-12',
                'statut' => NormeStatutEnum::ACTIF->value,
                'url_reference' => 'https://www.iso.org/standard/63787.html',
                'description' => 'Management de la santé et de la sécurité au travail',
            ],
            [
                'code_norme' => 'ISO-14001',
                'titre' => 'ISO 14001:2015 - Systèmes de management environnemental',
                'organisme_emission' => 'ISO',
                'categorie' => 'Environnement',
                'version' => '2015',
                'date_publication' => '2015-09-15',
                'statut' => NormeStatutEnum::ACTIF->value,
                'url_reference' => 'https://www.iso.org/standard/60857.html',
                'description' => 'Exigences et lignes directrices pour son utilisation',
            ],
            [
                'code_norme' => 'IEC-61010',
                'titre' => 'IEC 61010-1 - Exigences de sécurité pour appareils électriques de mesurage',
                'organisme_emission' => 'IEC',
                'categorie' => 'Sécurité Électrique',
                'version' => '2010',
                'date_publication' => '2010-06-10',
                'statut' => NormeStatutEnum::ACTIF->value,
                'url_reference' => 'https://webstore.iec.ch/publication/4283',
                'description' => 'Exigences générales de sécurité pour les appareils électriques de mesurage, de régulation et de laboratoire',
            ],
        ];

        foreach ($normes as $norme) {
            Norme::firstOrCreate(
                ['code_norme' => $norme['code_norme']],
                array_merge($norme, [
                    'id_norme' => Str::uuid()->toString()
                ])
            );
        }
    }
}
