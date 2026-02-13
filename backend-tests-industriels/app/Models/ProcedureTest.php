<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcedureTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'procedure_tests';
    protected $primaryKey = 'id_procedure';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_procedure',
        'code_procedure',
        'titre',
        'type_test_id',
        'version',
        'date_creation',
        'auteur_id',
        'validateur_id',
        'date_validation',
        'statut',
        'objectif',
        'domaine_application',
        'equipements_requis',
        'precautions_securite',
    ];

    protected $casts = [
        'date_creation' => 'date',
        'date_validation' => 'date',
        'equipements_requis' => 'array', // JSONB
    ];

    /**
     * Relations
     */
    public function typeTest()
    {
        return $this->belongsTo(TypeTest::class, 'type_test_id', 'id_type_test');
    }

    public function auteur()
    {
        return $this->belongsTo(Personnel::class, 'auteur_id', 'id_personnel');
    }

    public function validateur()
    {
        return $this->belongsTo(Personnel::class, 'validateur_id', 'id_personnel');
    }

    public function etapes()
    {
        return $this->hasMany(EtapeProcedure::class, 'procedure_id', 'id_procedure');
    }

    public function tests()
    {
        return $this->hasMany(TestIndustriel::class, 'procedure_id', 'id_procedure');
    }
}
