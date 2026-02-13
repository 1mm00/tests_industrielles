<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EtapeProcedure extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'etape_procedures';
    protected $primaryKey = 'id_etape';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_etape',
        'procedure_id',
        'numero_etape',
        'phase_id',
        'titre',
        'description',
        'duree_estimee_minutes',
        'equipements_requis',
        'conditions_realisation',
        'criteres_acceptation',
        'risques_associes',
        'mesures_securite',
    ];

    protected $casts = [
        'numero_etape' => 'integer',
        'duree_estimee_minutes' => 'integer',
    ];

    /**
     * Relations
     */
    public function procedure()
    {
        return $this->belongsTo(ProcedureTest::class, 'procedure_id', 'id_procedure');
    }

    public function phase()
    {
        return $this->belongsTo(PhaseTest::class, 'phase_id', 'id_phase');
    }
}
