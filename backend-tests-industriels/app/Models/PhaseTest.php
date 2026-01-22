<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PhaseTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'phases_tests';
    protected $primaryKey = 'id_phase';
    public $timestamps = false;

    protected $fillable = [
        'code_phase',
        'nom_phase',
        'description',
        'ordre_execution',
        'duree_estimee_heures',
        'obligatoire',
    ];
}
