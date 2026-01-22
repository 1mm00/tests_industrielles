<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Poste;
use App\Models\Departement;

class CheckReferentialData extends Command
{
    protected $signature = 'check:referential';
    protected $description = 'Vérifier les données des référentiels RH';

    public function handle()
    {
        $this->info('=== VÉRIFICATION DES DONNÉES RÉFÉRENTIELLES RH ===');
        $this->newLine();
        
        // Postes
        $postesCount = Poste::count();
        $this->info("📋 POSTES: {$postesCount} enregistrements");
        
        if ($postesCount > 0) {
            $this->table(
                ['ID', 'Libellé', 'Catégorie', 'Niveau Requis'],
                Poste::take(5)->get()->map(function($p) {
                    return [$p->id, $p->libelle, $p->categorie, $p->niveau_requis];
                })
            );
        } else {
            $this->error('❌ Aucun poste trouvé!');
        }
        
        $this->newLine();
        
        // Départements
        $deptsCount = Departement::count();
        $this->info("🏢 DÉPARTEMENTS: {$deptsCount} enregistrements");
        
        if ($deptsCount > 0) {
            $this->table(
                ['ID', 'Libellé', 'Catégorie', 'Site'],
                Departement::take(5)->get()->map(function($d) {
                    return [$d->id, $d->libelle, $d->categorie, $d->site];
                })
            );
        } else {
            $this->error('❌ Aucun département trouvé!');
        }
        
        $this->newLine();
        $this->info('✅ Vérification terminée!');
        
        return 0;
    }
}
