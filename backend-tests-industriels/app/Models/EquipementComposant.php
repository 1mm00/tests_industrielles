<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipementComposant extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'equipement_composants';
    protected $primaryKey = 'id_composant';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_composant',
        'equipement_id',
        'code_composant',
        'designation',
        'type_composant',
        'fabricant',
        'reference_fabricant',
        'date_installation',
        'duree_vie_prevue_heures',
        'niveau_criticite',
        'statut',
    ];

    protected $casts = [
        'date_installation' => 'date',
        'duree_vie_prevue_heures' => 'integer',
        'niveau_criticite' => 'integer',
    ];

    /**
     * Relations
     */
    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'id_equipement');
    }
}
