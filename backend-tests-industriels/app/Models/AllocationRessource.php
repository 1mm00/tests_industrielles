<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AllocationRessource extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'allocation_ressources';
    protected $primaryKey = 'id_allocation';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_allocation',
        'test_id',
        'personnel_id',
        'equipement_id',
        'role_allocation',
        'date_debut',
        'date_fin',
        'pourcentage_charge',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'pourcentage_charge' => 'decimal:2',
    ];

    /**
     * Relations
     */
    public function test()
    {
        return $this->belongsTo(TestIndustriel::class, 'test_id', 'id_test');
    }

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'personnel_id', 'id_personnel');
    }

    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'id_equipement');
    }
}
