<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasAuditLog;

class NonConformite extends Model
{
    use HasFactory, HasUuids, HasAuditLog;

    protected $table = 'non_conformites';
    protected $primaryKey = 'id_non_conformite';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id_non_conformite',
        'numero_nc',
        'test_id',
        'mesure_id',
        'equipement_id',
        'criticite_id',
        'type_nc',
        'description',
        'conclusions',
        'actions_correctives',
        'impact_potentiel',
        'date_detection',
        'detecteur_id',
        'co_detecteurs',
        'context_environnemental',
        'statut',
        'is_archived',
        'date_cloture',
        'valideur_cloture_id',
        'commentaires_cloture',
    ];

    protected $casts = [
        'co_detecteurs' => 'array',
        'context_environnemental' => 'array',
        'date_detection' => 'date',
        'date_cloture' => 'datetime',
        'is_archived' => 'boolean',
    ];


    /**
     * Relations
     */
    public function test()
    {
        return $this->belongsTo(TestIndustriel::class, 'test_id', 'id_test');
    }

    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'id_equipement');
    }

    public function criticite()
    {
        return $this->belongsTo(NiveauCriticite::class, 'criticite_id', 'id_niveau_criticite');
    }

    public function detecteur()
    {
        return $this->belongsTo(Personnel::class, 'detecteur_id', 'id_personnel');
    }

    public function causesRacines()
    {
        return $this->hasMany(CauseRacine::class, 'non_conformite_id', 'id_non_conformite');
    }

    public function planAction()
    {
        return $this->hasOne(PlanAction::class, 'non_conformite_id', 'id_non_conformite');
    }
}
