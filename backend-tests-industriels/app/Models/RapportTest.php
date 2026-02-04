<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RapportTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'rapport_tests';
    protected $primaryKey = 'id_rapport';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'test_id',
        'numero_rapport',
        'type_rapport',
        'titre_rapport',
        'recommandations',
        'date_edition',
        'redacteur_id',
        'valideur_id',
        'date_validation',
        'statut',
        'resume_executif',
        'structure_rapport',
        'fichier_pdf_url',
    ];

    protected $casts = [
        'date_edition' => 'date',
        'date_validation' => 'date',
        'structure_rapport' => 'array',
    ];

    public function test()
    {
        return $this->belongsTo(TestIndustriel::class, 'test_id', 'id_test');
    }

    public function redacteur()
    {
        return $this->belongsTo(Personnel::class, 'redacteur_id', 'id_personnel');
    }

    public function valideur()
    {
        return $this->belongsTo(Personnel::class, 'valideur_id', 'id_personnel');
    }
}
