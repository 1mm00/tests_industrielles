<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ValeurKpi extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'valeur_kpis';
    protected $primaryKey = 'id_valeur';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_valeur',
        'kpi_id',
        'periode_debut',
        'periode_fin',
        'valeur',
        'statut',
        'commentaire',
    ];

    protected $casts = [
        'periode_debut' => 'date',
        'periode_fin' => 'date',
        'valeur' => 'decimal:2',
    ];

    /**
     * Relations
     */
    public function kpi()
    {
        return $this->belongsTo(Kpi::class, 'kpi_id', 'id_kpi');
    }
}
