<?php

namespace App\Models;

use App\Enums\EquipementStatutEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipement extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'equipements';
    protected $primaryKey = 'id_equipement';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code_equipement',
        'designation',
        'fabricant',
        'modele',
        'numero_serie',
        'annee_fabrication',
        'date_mise_service',
        'categorie_equipement',
        'sous_categorie',
        'localisation_site',
        'localisation_precise',
        'puissance_nominale_kw',
        'caracteristiques_techniques',
        'niveau_criticite',
        'statut_operationnel',
        'proprietaire_id',
        'responsable_id',
        'date_dernier_test',
        'date_prochain_test',
    ];

    protected $casts = [
        'annee_fabrication' => 'integer',
        'date_mise_service' => 'date',
        'puissance_nominale_kw' => 'decimal:2',
        'caracteristiques_techniques' => 'array', // JSONB
        'niveau_criticite' => 'integer',
        'statut_operationnel' => EquipementStatutEnum::class,
        'date_dernier_test' => 'date',
        'date_prochain_test' => 'date',
    ];

    /**
     * Relations
     */
    public function proprietaire()
    {
        return $this->belongsTo(Organisation::class, 'proprietaire_id', 'id_organisation');
    }

    public function responsable()
    {
        return $this->belongsTo(Personnel::class, 'responsable_id', 'id_personnel');
    }

    public function testsIndustriels()
    {
        return $this->hasMany(TestIndustriel::class, 'equipement_id', 'id_equipement');
    }

    public function nonConformites()
    {
        return $this->hasMany(NonConformite::class, 'equipement_id', 'id_equipement');
    }

    public function composants()
    {
        return $this->hasMany(EquipementComposant::class, 'equipement_id', 'id_equipement');
    }

    public function normes()
    {
        return $this->belongsToMany(Norme::class, 'equipements_normes', 'equipement_id', 'norme_id', 'id_equipement', 'id_norme')
            ->withPivot('conformite_validee', 'date_validation');
    }

    /**
     * Scopes
     */
    public function scopeEnService($query)
    {
        return $query->where('statut_operationnel', EquipementStatutEnum::EN_SERVICE);
    }

    public function scopeParCriticite($query, int $niveau)
    {
        return $query->where('niveau_criticite', $niveau);
    }

    public function scopeParLocalisation($query, string $site)
    {
        return $query->where('localisation_site', $site);
    }
}
