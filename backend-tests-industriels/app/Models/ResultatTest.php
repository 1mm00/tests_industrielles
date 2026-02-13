<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultatTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'resultat_tests';
    protected $primaryKey = 'id_resultat';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_resultat',
        'test_id',
        'type_resultat',
        'resultat_global',
        'taux_reussite_pct',
        'nombre_points_controle',
        'nombre_conformes',
        'nombre_non_conformes',
        'synthese',
        'recommandations',
        'details_resultats',
    ];

    protected $casts = [
        'taux_reussite_pct' => 'decimal:2',
        'nombre_points_controle' => 'integer',
        'nombre_conformes' => 'integer',
        'nombre_non_conformes' => 'integer',
        'details_resultats' => 'array', // JSONB
    ];

    /**
     * Relations
     */
    public function test()
    {
        return $this->belongsTo(TestIndustriel::class, 'test_id', 'id_test');
    }
}
