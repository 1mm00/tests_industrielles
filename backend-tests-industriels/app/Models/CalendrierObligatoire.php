<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendrierObligatoire extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'calendrier_obligatoires';
    protected $primaryKey = 'id_calendrier';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_calendrier',
        'equipement_id',
        'type_test_id',
        'frequence',
        'prochaine_echeance',
        'derniere_realisation',
        'alerte_active',
        'jours_preavis',
    ];

    protected $casts = [
        'prochaine_echeance' => 'date',
        'derniere_realisation' => 'date',
        'alerte_active' => 'boolean',
        'jours_preavis' => 'integer',
    ];

    /**
     * Relations
     */
    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'id_equipement');
    }

    public function typeTest()
    {
        return $this->belongsTo(TypeTest::class, 'type_test_id', 'id_type_test');
    }
}
