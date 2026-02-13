<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poste extends Model
{
    use HasFactory, \Illuminate\Database\Eloquent\Concerns\HasUuids;

    protected $table = 'postes';
    protected $primaryKey = 'id_poste';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code_poste',
        'libelle',
        'categorie',
        'description',
        'role_id',
        'actif',
    ];

    protected $casts = [
        'role_id' => 'string',
        'actif' => 'boolean',
    ];

    /**
     * Relation avec le rôle associé
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id_role');
    }

    /**
     * Relation avec le personnel à ce poste
     */
    public function personnels()
    {
        return $this->hasMany(Personnel::class, 'poste_id', 'id_poste');
    }

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

    /**
     * Scope filtré par rôle (Ingénieur, Technicien, etc.)
     */
    public function scopeForRole($query, ?string $roleId)
    {
        if (!$roleId) return $query;

        $role = \App\Models\Role::find($roleId);
        if (!$role || $role->nom_role === 'Admin') return $query;

        $roleName = $role->nom_role;

        // On définit une map stricte par catégorie et par mots-clés
        $config = [
            'Ingénieur' => [
                'categories' => ['Ingénierie', 'Qualité'],
                'keywords' => ['Ingénieur', 'Responsable', 'Analyste', 'Expert']
            ],
            'Technicien' => [
                'categories' => ['Production', 'Maintenance', 'Technique'],
                'keywords' => ['Technicien', 'Opérateur', 'Mécanicien', 'Agent']
            ],
            'Lecteur' => [
                'categories' => ['Administratif', 'Documentation', 'Support'],
                'keywords' => ['Archiviste', 'Lecteur', 'Assistant']
            ],
        ];

        $roleConfig = $config[$roleName] ?? null;
        if (!$roleConfig) return $query;

        return $query->where(function ($q) use ($roleConfig, $roleName) {
            // Match par catégorie
            $q->whereIn('categorie', $roleConfig['categories']);
            
            // Match par mot-clé dans le libellé
            foreach ($roleConfig['keywords'] as $kw) {
                $q->orWhere('libelle', 'like', "%{$kw}%");
            }
        })
        // Filtre d'exclusion mutuelle pour éviter les débordements (ex: Technicien qui a catégorie Technique ne doit pas aller chez Ingénieur)
        ->when($roleName === 'Ingénieur', function($q) {
            $q->where('libelle', 'not like', '%Technicien%')
              ->where('libelle', 'not like', '%Opérateur%');
        })
        ->when($roleName === 'Technicien', function($q) {
            $q->where('libelle', 'not like', '%Ingénieur%');
        });
    }
}
