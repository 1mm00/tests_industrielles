<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ObservationTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'observation_tests';
    protected $primaryKey = 'id_observation';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_observation',
        'test_id',
        'session_id',
        'date_heure_observation',
        'observateur_id',
        'type_observation',
        'description',
        'niveau_severite',
        'donnees_complementaires',
    ];

    protected $casts = [
        'date_heure_observation' => 'datetime',
        'donnees_complementaires' => 'array', // JSONB
    ];

    /**
     * Relations
     */
    public function test()
    {
        return $this->belongsTo(TestIndustriel::class, 'test_id', 'id_test');
    }

    public function session()
    {
        return $this->belongsTo(SessionTest::class, 'session_id', 'id_session');
    }

    public function observateur()
    {
        return $this->belongsTo(Personnel::class, 'observateur_id', 'id_personnel');
    }
}
