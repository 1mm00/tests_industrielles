<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personnel extends Model
{
    use HasFactory, \Illuminate\Database\Eloquent\Concerns\HasUuids;

    protected $table = 'personnels';
    protected $primaryKey = 'id_personnel';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'matricule',
        'cin',
        'nom',
        'prenom',
        'email',
        'telephone',
        'poste',
        'departement',
        'role_id',
        'date_embauche',
        'actif',
        'habilitations'
    ];

    protected $casts = [
        'date_embauche' => 'date',
        'actif' => 'boolean',
        'habilitations' => 'array',
    ];

    /**
     * Relation avec Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id_role');
    }

    /**
     * Attribut calculé pour le nom complet
     */
    public function getNomCompletAttribute()
    {
        return "{$this->prenom} {$this->nom}";
    }

    protected $appends = ['nom_complet'];

    /**
     * Relation avec les tests industriels (en tant que responsable)
     */
    public function testsIndustriels()
    {
        return $this->hasMany(TestIndustriel::class, 'responsable_test_id', 'id_personnel');
    }
}
