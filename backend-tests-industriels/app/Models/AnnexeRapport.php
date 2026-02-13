<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexeRapport extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'annexe_rapports';
    protected $primaryKey = 'id_annexe';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_annexe',
        'rapport_id',
        'numero_annexe',
        'titre',
        'type_annexe',
        'description',
        'fichier_url',
    ];

    /**
     * Relations
     */
    public function rapport()
    {
        return $this->belongsTo(RapportTest::class, 'rapport_id', 'id_rapport');
    }
}
