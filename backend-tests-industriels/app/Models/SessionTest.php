<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SessionTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'session_tests';
    protected $primaryKey = 'id_session';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_session',
        'test_id',
        'numero_session',
        'date_heure_debut',
        'date_heure_fin',
        'duree_minutes',
        'responsable_id',
        'equipe',
        'statut',
        'observations',
    ];

    protected $casts = [
        'date_heure_debut' => 'datetime',
        'date_heure_fin' => 'datetime',
        'equipe' => 'array', // JSONB
    ];

    /**
     * Relations
     */
    public function test()
    {
        return $this->belongsTo(TestIndustriel::class, 'test_id', 'id_test');
    }

    public function responsable()
    {
        return $this->belongsTo(Personnel::class, 'responsable_id', 'id_personnel');
    }
}
