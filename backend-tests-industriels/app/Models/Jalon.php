<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jalon extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'jalons';
    protected $primaryKey = 'id_jalon';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_jalon',
        'test_id',
        'nom_jalon',
        'description',
        'date_prevue',
        'date_realisee',
        'statut',
        'responsable_id',
    ];

    protected $casts = [
        'date_prevue' => 'date',
        'date_realisee' => 'date',
    ];

    /**
     * Relations
     */
    public function test()
    {
        return $this->belongsTo(TestIndustriel::class, 'test_id', 'id_test');
    }

    public function responsable()
    {
        return $this->belongsTo(Personnel::class, 'responsable_id', 'id_personnel');
    }
}
