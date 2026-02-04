<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcedureTest extends Model
{
    use HasFactory, \Illuminate\Database\Eloquent\Concerns\HasUuids;

    protected $table = 'procedure_tests';
    protected $primaryKey = 'id_procedure';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code_procedure',
        'titre',
        'type_test_id',
        'version',
        'statut',
        'objectif'
    ];
}
