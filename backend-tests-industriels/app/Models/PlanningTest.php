<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanningTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'planning_tests';
    protected $primaryKey = 'id_planning';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_planning',
        'test_id',
        'date_prevue',
        'date_realisee',
        'duree_prevue_heures',
        'duree_reelle_heures',
        'statut',
        'remarques',
    ];

    protected $casts = [
        'date_prevue' => 'date',
        'date_realisee' => 'date',
        'duree_prevue_heures' => 'integer',
        'duree_reelle_heures' => 'integer',
    ];

    /**
     * Relations
     */
    public function test()
    {
        return $this->belongsTo(TestIndustriel::class, 'test_id', 'id_test');
    }
}
