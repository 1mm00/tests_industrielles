<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poste extends Model
{
    use HasFactory;

    protected $fillable = [
        'libelle',
        'categorie',
        'niveau_requis',
        'description',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    /**
     * Scope pour les postes actifs
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
}
