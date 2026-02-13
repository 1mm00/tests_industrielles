<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectionRapport extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'section_rapports';
    protected $primaryKey = 'id_section';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_section',
        'rapport_id',
        'numero_section',
        'titre',
        'ordre_affichage',
        'contenu',
        'tableaux_donnees',
    ];

    protected $casts = [
        'ordre_affichage' => 'integer',
        'tableaux_donnees' => 'array', // JSONB
    ];

    /**
     * Relations
     */
    public function rapport()
    {
        return $this->belongsTo(RapportTest::class, 'rapport_id', 'id_rapport');
    }
}
