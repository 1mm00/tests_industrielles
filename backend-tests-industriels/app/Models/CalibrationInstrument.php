<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalibrationInstrument extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'calibration_instruments';
    protected $primaryKey = 'id_calibration';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_calibration',
        'instrument_id',
        'numero_certificat',
        'date_calibration',
        'organisme_calibration_id',
        'methode_calibration',
        'norme_reference',
        'etalon_reference',
        'incertitude_mesure',
        'resultat_calibration',
        'ecarts_mesures',
        'date_prochaine_calibration',
        'technicien_id',
        'observations',
        'certificat_url',
    ];

    protected $casts = [
        'date_calibration' => 'date',
        'date_prochaine_calibration' => 'date',
        'ecarts_mesures' => 'array', // JSONB
    ];

    /**
     * Relations
     */
    public function instrument()
    {
        return $this->belongsTo(InstrumentMesure::class, 'instrument_id', 'id_instrument');
    }

    public function technicien()
    {
        return $this->belongsTo(Personnel::class, 'technicien_id', 'id_personnel');
    }

    public function organisme()
    {
        return $this->belongsTo(Organisation::class, 'organisme_calibration_id', 'id_organisation');
    }
}
