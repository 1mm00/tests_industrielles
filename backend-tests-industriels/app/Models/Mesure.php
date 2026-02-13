<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesure extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'mesures';
    protected $primaryKey = 'id_mesure';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'session_id',
        'test_id',
        'item_id',
        'criticite',
        'instrument_id',
        'type_mesure',
        'parametre_mesure',
        'valeur_mesuree',
        'unite_mesure',
        'valeur_reference',
        'tolerance_min',
        'tolerance_max',
        'ecart_absolu',
        'ecart_pct',
        'conforme',
        'incertitude_mesure',
        'timestamp_mesure',
        'conditions_mesure',
        'operateur_id',
    ];

    protected $casts = [
        'valeur_mesuree' => 'decimal:4',
        'valeur_reference' => 'decimal:4',
        'tolerance_min' => 'decimal:4',
        'tolerance_max' => 'decimal:4',
        'ecart_absolu' => 'decimal:4',
        'ecart_pct' => 'decimal:2',
        'conforme' => 'boolean',
        'criticite' => 'integer',
        'timestamp_mesure' => 'datetime',
        'conditions_mesure' => 'array',
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

    public function instrument()
    {
        return $this->belongsTo(InstrumentMesure::class, 'instrument_id', 'id_instrument');
    }

    public function operateur()
    {
        return $this->belongsTo(Personnel::class, 'operateur_id', 'id_personnel');
    }

    /**
     * Scopes
     */
    public function scopeConformes($query)
    {
        return $query->where('conforme', true);
    }

    public function scopeNonConformes($query)
    {
        return $query->where('conforme', false);
    }

    public function scopeParTest($query, string $testId)
    {
        return $query->where('test_id', $testId);
    }
}
