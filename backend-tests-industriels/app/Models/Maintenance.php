<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\HasAuditLog;

class Maintenance extends Model
{
    use HasFactory, HasUuids, HasAuditLog;

    protected $table = 'maintenances';
    protected $primaryKey = 'id_maintenance';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'equipement_id',
        'numero_intervention',
        'titre',
        'description',
        'type',
        'priorite',
        'date_prevue',
        'date_realisation',
        'technicien_id',
        'statut',
        'rapport_technique',
        'cout_estime',
        'cout_reel',
        'pieces_changees',
        'periodicite_jours',
    ];

    protected $casts = [
        'date_prevue' => 'date',
        'date_realisation' => 'date',
        'pieces_changees' => 'array',
        'cout_estime' => 'decimal:2',
        'cout_reel' => 'decimal:2',
        'periodicite_jours' => 'integer',
    ];

    /**
     * Relations
     */
    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'id_equipement');
    }

    public function technicien()
    {
        return $this->belongsTo(Personnel::class, 'technicien_id', 'id_personnel');
    }
}
