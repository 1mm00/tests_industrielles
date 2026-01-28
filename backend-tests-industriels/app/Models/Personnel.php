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
}
