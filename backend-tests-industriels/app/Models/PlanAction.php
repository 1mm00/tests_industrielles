<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanAction extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'plan_actions';
    protected $primaryKey = 'id_plan';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_plan',
        'non_conformite_id',
        'numero_plan',
        'date_creation',
        'date_echeance',
        'responsable_plan_id',
        'statut_plan',
        'objectifs',
        'date_cloture',
        'efficacite_pct',
    ];

    protected $casts = [
        'date_creation' => 'date',
        'date_echeance' => 'date',
        'date_cloture' => 'date',
        'efficacite_pct' => 'decimal:2',
    ];

    /**
     * Relations
     */
    public function nonConformite()
    {
        return $this->belongsTo(NonConformite::class, 'non_conformite_id', 'id_non_conformite');
    }

    public function responsable()
    {
        return $this->belongsTo(Personnel::class, 'responsable_plan_id', 'id_personnel');
    }

    public function actions()
    {
        return $this->hasMany(ActionCorrective::class, 'plan_id', 'id_plan');
    }
}
