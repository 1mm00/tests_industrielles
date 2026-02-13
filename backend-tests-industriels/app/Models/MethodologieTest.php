<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MethodologieTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'methodologies_tests';
    protected $primaryKey = 'id_methodologie';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_methodologie',
        'code_methodologie',
        'nom',
        'description',
        'domaine_application',
        'etapes_principales',
        'parametres_configuration',
        'actif',
    ];

    protected $casts = [
        'parametres_configuration' => 'array', // JSONB
        'actif' => 'boolean',
    ];
}
