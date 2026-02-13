<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CauseRacine extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'cause_racines';
    protected $primaryKey = 'id_cause';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_cause',
        'non_conformite_id',
        'type_cause',
        'description',
        'categorie',
        'analyse_5_pourquoi',
        'probabilite_recurrence_pct',
    ];

    protected $casts = [
        'probabilite_recurrence_pct' => 'decimal:2',
    ];

    /**
     * Relations
     */
    public function nonConformite()
    {
        return $this->belongsTo(NonConformite::class, 'non_conformite_id', 'id_non_conformite');
    }

    public function actionsCorrectives()
    {
        return $this->hasMany(ActionCorrective::class, 'cause_racine_id', 'id_cause');
    }
}
