<?php

namespace App\Models;

use App\Enums\InstrumentCategorieMesureEnum;
use App\Enums\InstrumentStatutEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class InstrumentMesure extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'instruments_mesure';
    protected $primaryKey = 'id_instrument';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_instrument',
        'code_instrument',
        'designation',
        'type_instrument',
        'categorie_mesure',
        'fabricant',
        'modele',
        'numero_serie',
        'precision',
        'plage_mesure_min',
        'plage_mesure_max',
        'unite_mesure',
        'resolution',
        'date_acquisition',
        'date_derniere_calibration',
        'date_prochaine_calibration',
        'periodicite_calibration_mois',
        'statut',
        'localisation',
        'certificat_calibration_url',
    ];


    protected $casts = [
        'plage_mesure_min' => 'decimal:4',
        'plage_mesure_max' => 'decimal:4',
        'date_acquisition' => 'date',
        'date_derniere_calibration' => 'date',
        'date_prochaine_calibration' => 'date',
        'periodicite_calibration_mois' => 'integer',
        'categorie_mesure' => InstrumentCategorieMesureEnum::class,
        'statut' => InstrumentStatutEnum::class,
    ];

    /**
     * Accessors
     */
    protected function joursAvantCalibration(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->date_prochaine_calibration 
                ? Carbon::now()->diffInDays($this->date_prochaine_calibration, false) 
                : null,
        );
    }

    /**
     * Relations
     */
    public function calibrations()
    {
        return $this->hasMany(CalibrationInstrument::class, 'instrument_id', 'id_instrument');
    }

    public function mesures()
    {
        return $this->hasMany(Mesure::class, 'instrument_id', 'id_instrument');
    }

    public function tests()
    {
        return $this->belongsToMany(TestIndustriel::class, 'tests_instruments', 'instrument_id', 'test_id', 'id_instrument', 'id_test')
            ->withPivot('utilisation');
    }

    /**
     * Scopes
     */
    public function scopeOperationnels($query)
    {
        return $query->where('statut', InstrumentStatutEnum::OPERATIONNEL);
    }

    public function scopeCalibrationEchue($query)
    {
        return $query->where('date_prochaine_calibration', '<', Carbon::now())
            ->where('statut', InstrumentStatutEnum::OPERATIONNEL);
    }

    public function scopeAlerteCalibration($query, int $jours = 30)
    {
        return $query->whereBetween('date_prochaine_calibration', [
            Carbon::now(),
            Carbon::now()->addDays($jours)
        ])->where('statut', InstrumentStatutEnum::OPERATIONNEL);
    }
}
