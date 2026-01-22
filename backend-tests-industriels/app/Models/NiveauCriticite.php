<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NiveauCriticite extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'niveaux_criticite';
    protected $primaryKey = 'id_niveau_criticite';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'code_niveau',
        'libelle',
        'description',
        'delai_traitement_max_heures',
        'couleur_indicateur',
        'ordre_affichage',
    ];

    protected $casts = [
        'delai_traitement_max_heures' => 'integer',
        'ordre_affichage' => 'integer',
    ];

    /**
     * Relations
     */
    public function nonConformites()
    {
        return $this->hasMany(NonConformite::class, 'criticite_id', 'id_niveau');
    }
}
