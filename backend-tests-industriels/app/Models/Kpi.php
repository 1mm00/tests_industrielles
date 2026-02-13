<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kpi extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kpis';
    protected $primaryKey = 'id_kpi';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_kpi',
        'code_kpi',
        'libelle',
        'description',
        'unite_mesure',
        'frequence_calcul',
        'formule_calcul',
        'seuil_alerte',
        'objectif',
        'actif',
    ];

    protected $casts = [
        'seuil_alerte' => 'decimal:2',
        'objectif' => 'decimal:2',
        'actif' => 'boolean',
    ];

    /**
     * Relations
     */
    public function valeurs()
    {
        return $this->hasMany(ValeurKpi::class, 'kpi_id', 'id_kpi');
    }
}
