<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificat extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'certificats';
    protected $primaryKey = 'id_certificat';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_certificat',
        'numero_certificat',
        'type_certificat',
        'equipement_id',
        'instrument_id',
        'organisme_delivrance_id',
        'date_emission',
        'date_expiration',
        'statut',
        'fichier_url',
    ];

    protected $casts = [
        'date_emission' => 'date',
        'date_expiration' => 'date',
    ];

    /**
     * Relations
     */
    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'id_equipement');
    }

    public function instrument()
    {
        return $this->belongsTo(InstrumentMesure::class, 'instrument_id', 'id_instrument');
    }

    public function organisme()
    {
        return $this->belongsTo(Organisation::class, 'organisme_delivrance_id', 'id_organisation');
    }
}
