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

    /**
     * Scope filtré par rôle (Ingénieur, Technicien, etc.)
     */
    public function scopeForRole($query, ?string $roleId)
    {
        if (!$roleId) return $query;

        $role = \App\Models\Role::find($roleId);
        if (!$role || $role->nom_role === 'Admin') return $query;

        $categorieMap = [
            'Ingénieur' => ['Qualité', 'R&D', 'Ingénierie'],
            'Technicien' => ['Technique', 'Production', 'Maintenance'],
            'Lecteur' => ['Documentation', 'Support'],
        ];

        $categories = $categorieMap[$role->nom_role] ?? [];
        if (!empty($categories)) {
            return $query->whereIn('categorie', $categories);
        }

        return $query;
    }

    /**
     * Scope filtré par poste (Ingénieur, Technicien, etc.)
     * Heuristique intelligente pour filtrer les départements selon l'intitulé du poste
     */
    public function scopeForPoste($query, ?string $poste)
    {
        if (!$poste) return $query;

        $posteLower = strtolower($poste);

        // Si le poste contient certains mots clés, on filtre la catégorie du département
        if (str_contains($posteLower, 'prod') || str_contains($posteLower, 'fabric')) {
            return $query->whereIn('categorie', ['Production', 'Technique']);
        }

        if (str_contains($posteLower, 'maint') || str_contains($posteLower, 'repar')) {
            return $query->whereIn('categorie', ['Maintenance', 'Technique']);
        }

        if (str_contains($posteLower, 'qual') || str_contains($posteLower, 'test') || str_contains($posteLower, 'contr')) {
            return $query->whereIn('categorie', ['Qualité', 'Technique']);
        }

        if (str_contains($posteLower, 'r&d') || str_contains($posteLower, 'concep')) {
            return $query->whereIn('categorie', ['R&D', 'Technique']);
        }

        if (str_contains($posteLower, 'admin') || str_contains($posteLower, 'doc') || str_contains($posteLower, 'archiv')) {
            return $query->whereIn('categorie', ['Documentation', 'Support']);
        }

        return $query;
    }
}
