<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActionCorrective extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'action_correctives';
    protected $primaryKey = 'id_action';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_action',
        'non_conformite_id',
        'plan_id',
        'cause_racine_id',
        'numero_action',
        'type_action',
        'description',
        'responsable_id',
        'date_prevue',
        'date_realisee',
        'statut',
        'cout_estime_eur',
        'cout_reel_eur',
        'commentaires',
    ];

    protected $casts = [
        'date_prevue' => 'date',
        'date_realisee' => 'date',
        'cout_estime_eur' => 'decimal:2',
        'cout_reel_eur' => 'decimal:2',
    ];

    /**
     * Relations
     */
    public function nonConformite()
    {
        return $this->belongsTo(NonConformite::class, 'non_conformite_id', 'id_non_conformite');
    }

    public function causeRacine()
    {
        return $this->belongsTo(CauseRacine::class, 'cause_racine_id', 'id_cause');
    }

    public function responsable()
    {
        return $this->belongsTo(Personnel::class, 'responsable_id', 'id_personnel');
    }

    public function planAction()
    {
        return $this->belongsTo(PlanAction::class, 'plan_id', 'id_plan');
    }
}
