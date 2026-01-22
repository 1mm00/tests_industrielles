<?php

namespace App\Models;

use App\Enums\NormeStatutEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Norme extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'normes';
    protected $primaryKey = 'id_norme';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code_norme',
        'titre',
        'organisme_emission',
        'categorie',
        'version',
        'date_publication',
        'date_derniere_revision',
        'statut',
        'url_reference',
        'description',
    ];

    protected $casts = [
        'date_publication' => 'date',
        'date_derniere_revision' => 'date',
        'statut' => NormeStatutEnum::class,
    ];

    /**
     * Relations
     */
    public function testsNormesApplicables()
    {
        return $this->hasMany(TestsNormesApplicable::class, 'norme_id', 'id_norme');
    }

    public function equipementsNormes()
    {
        return $this->hasMany(EquipementNorme::class, 'norme_id', 'id_norme');
    }

    /**
     * Scopes
     */
    public function scopeActives($query)
    {
        return $query->where('statut', NormeStatutEnum::ACTIF);
    }

    public function scopeByOrganisme($query, string $organisme)
    {
        return $query->where('organisme_emission', $organisme);
    }

    public function scopeByCategorie($query, string $categorie)
    {
        return $query->where('categorie', $categorie);
    }
}
