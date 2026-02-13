<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personnel extends Model
{
    use HasFactory, \Illuminate\Database\Eloquent\Concerns\HasUuids;

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($personnel) {
            if ($personnel->testsIndustriels()->exists()) {
                throw new \Exception("Action bloquée : Ce membre du personnel est responsable de tests industriels enregistrés et ne peut être supprimé.");
            }

            // Vérifier s'il fait partie d'une équipe de test (JSONB check)
            if (\App\Models\TestIndustriel::whereJsonContains('equipe_test', $personnel->id_personnel)->exists()) {
                throw new \Exception("Action bloquée : Ce membre fait partie d'une cohorte opérationnelle sur des tests existants.");
            }
        });
    }

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
        'departement_id',
        'poste_id',
        'role_id',
        'date_embauche',
        'actif',
        'habilitations'
    ];

    protected $casts = [
        'date_embauche' => 'date',
        'actif' => 'boolean',
        'habilitations' => 'array',
        'departement_id' => 'string',
        'poste_id' => 'string',
    ];

    /**
     * Relation avec le département
     */
    public function departement()
    {
        return $this->belongsTo(Departement::class, 'departement_id', 'id_departement');
    }

    /**
     * Relation avec le poste
     */
    public function posteRel()
    {
        return $this->belongsTo(Poste::class, 'poste_id', 'id_poste');
    }

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
