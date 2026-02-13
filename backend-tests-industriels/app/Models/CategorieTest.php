<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategorieTest extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'categories_tests';
    protected $primaryKey = 'id_categorie';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_categorie',
        'code_categorie',
        'libelle',
        'categorie_parent_id',
        'niveau_hierarchie',
        'ordre_affichage',
        'description',
    ];

    /**
     * Relations
     */
    public function parent()
    {
        return $this->belongsTo(CategorieTest::class, 'categorie_parent_id', 'id_categorie');
    }

    public function enfants()
    {
        return $this->hasMany(CategorieTest::class, 'categorie_parent_id', 'id_categorie');
    }
}
