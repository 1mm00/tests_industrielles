<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departement extends Model
{
    use HasFactory;

    protected $fillable = [
        'libelle',
        'categorie',
        'site',
        'description',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    /**
     * Scope pour les départements actifs
     */
    public function scopeActifs($query)
    {
        return $query->where('actif', true);
    }

    /**
     * Scope par catégorie
     */
    public function scopeByCategorie($query, string $categorie)
    {
        return $query->where('categorie', $categorie);
    }

    /**
     * Scope par site
     */
    public function scopeBySite($query, string $site)
    {
        return $query->where('site', $site);
    }
}
