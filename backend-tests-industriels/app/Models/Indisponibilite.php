<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Indisponibilite extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'indisponibilites';
    protected $primaryKey = 'id_indisponibilite';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_indisponibilite',
        'equipement_id',
        'personnel_id',
        'date_debut',
        'date_fin',
        'type_indisponibilite',
        'motif',
        'commentaire',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    /**
     * Relations
     */
    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'id_equipement');
    }

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'personnel_id', 'id_personnel');
    }
}
