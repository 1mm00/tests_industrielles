<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeTest extends Model
{
    use HasFactory, HasUuids;

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($typeTest) {
            if ($typeTest->testsIndustriels()->exists()) {
                throw new \Exception("Action bloquée : Ce type de contrôle est déjà utilisé dans des tests industriels et ne peut être supprimé.");
            }
        });
    }

    protected $table = 'types_tests';
    protected $primaryKey = 'id_type_test';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'code_type',
        'libelle',
        'categorie_principale',
        'sous_categorie',
        'description',
        'equipements_eligibles',
        'instruments_eligibles',
        'niveau_criticite_defaut',
        'duree_estimee_jours',
        'frequence_recommandee',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
        'duree_estimee_jours' => 'decimal:2',
        'niveau_criticite_defaut' => 'integer',
        'equipements_eligibles' => 'array',
        'instruments_eligibles' => 'array',
    ];

    /**
     * Relations
     */
    public function checklistsControle()
    {
        return $this->hasMany(ChecklistControle::class, 'type_test_id', 'id_type_test');
    }

    public function proceduresTest()
    {
        return $this->hasMany(ProcedureTest::class, 'type_test_id', 'id_type_test');
    }

    public function testsIndustriels()
    {
        return $this->hasMany(TestIndustriel::class, 'type_test_id', 'id_type_test');
    }

    /**
     * Scopes
     */
    public function scopeActifs($query)
    {
        return $query->where('actif', true);
    }

    public function scopeObligatoires($query)
    {
        return $query->where('categorie_principale', 'Obligatoire');
    }

    public function scopeStandard($query)
    {
        return $query->where('categorie_principale', 'Standard');
    }
}
