<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organisation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'organisations';
    protected $primaryKey = 'id_organisation';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_organisation',
        'code_organisation',
        'nom',
        'type_organisation',
        'siret',
        'adresse',
        'ville',
        'code_postal',
        'pays',
        'telephone',
        'email',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    /**
     * Relations
     */
    public function personnels()
    {
        return $this->hasMany(Personnel::class, 'departement_id', 'id_organisation'); // Note: Adjust if logic differs
    }

    public function calibrations()
    {
        return $this->hasMany(CalibrationInstrument::class, 'organisme_calibration_id', 'id_organisation');
    }
}
