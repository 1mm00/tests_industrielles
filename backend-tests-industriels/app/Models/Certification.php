<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'certifications';
    protected $primaryKey = 'id_certification';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_certification',
        'personnel_id',
        'type_certification',
        'organisme_delivrance',
        'numero_certification',
        'date_obtention',
        'date_expiration',
        'statut',
        'document_url',
    ];

    protected $casts = [
        'date_obtention' => 'date',
        'date_expiration' => 'date',
    ];

    /**
     * Relations
     */
    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'personnel_id', 'id_personnel');
    }
}
