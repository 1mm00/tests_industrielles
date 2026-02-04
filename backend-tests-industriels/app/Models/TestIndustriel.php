<?php

namespace App\Models;

use App\Enums\TestStatutEnum;
use App\Enums\TestResultatEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TestIndustriel extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tests_industriels';
    protected $primaryKey = 'id_test';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'numero_test',
        'type_test_id',
        'equipement_id',
        'phase_id',
        'procedure_id',
        'date_test',
        'heure_debut',
        'heure_fin',
        'duree_reelle_heures',
        'localisation',
        'conditions_environnementales',
        'niveau_criticite',
        'statut_test',
        'resultat_global',
        'taux_conformite_pct',
        'responsable_test_id',
        'equipe_test',
        'observations_generales',
        'incidents_signales',
        'arret_production_requis',
        'duree_arret_heures',
        'instrument_id',
        'statut_final',
        'resultat_attendu',
        'heure_debut_planifiee',
        'heure_fin_planifiee',
        'created_by',
    ];

    protected $casts = [
        'date_test' => 'date',
        'heure_debut' => 'datetime:Y-m-d H:i:s',
        'heure_fin' => 'datetime:Y-m-d H:i:s',
        'heure_debut_planifiee' => 'string',
        'heure_fin_planifiee' => 'string',
        'duree_reelle_heures' => 'decimal:2',
        'conditions_environnementales' => 'array', // JSONB
        'niveau_criticite' => 'integer',
        'statut_test' => TestStatutEnum::class,
        'resultat_global' => TestResultatEnum::class,
        'taux_conformite_pct' => 'decimal:2',
        'equipe_test' => 'array', // JSONB array of UUIDs
        'arret_production_requis' => 'boolean',
        'duree_arret_heures' => 'decimal:2',
    ];

    /**
     * Boot method - génération automatique numero_test
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($test) {
            if (empty($test->numero_test)) {
                $test->numero_test = static::genererNumeroTest();
            }
        });
    }

    /**
     * Relations
     */
    public function typeTest()
    {
        return $this->belongsTo(TypeTest::class, 'type_test_id', 'id_type_test');
    }

    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'id_equipement');
    }

    public function phase()
    {
        return $this->belongsTo(PhaseTest::class, 'phase_id', 'id_phase');
    }

    public function procedure()
    {
        return $this->belongsTo(ProcedureTest::class, 'procedure_id', 'id_procedure');
    }

    public function responsable()
    {
        return $this->belongsTo(Personnel::class, 'responsable_test_id', 'id_personnel');
    }

    public function createur()
    {
        return $this->belongsTo(Personnel::class, 'created_by', 'id_personnel');
    }

    public function instrument()
    {
        return $this->belongsTo(InstrumentMesure::class, 'instrument_id', 'id_instrument');
    }

    public function sessions()
    {
        return $this->hasMany(SessionTest::class, 'test_id', 'id_test');
    }

    public function mesures()
    {
        return $this->hasMany(Mesure::class, 'test_id', 'id_test');
    }

    public function resultats()
    {
        return $this->hasMany(ResultatTest::class, 'test_id', 'id_test');
    }

    public function observations()
    {
        return $this->hasMany(ObservationTest::class, 'test_id', 'id_test');
    }

    public function normes()
    {
        return $this->belongsToMany(Norme::class, 'tests_normes_applicables', 'test_id', 'norme_id', 'id_test', 'id_norme')
            ->withPivot('application_obligatoire');
    }

    public function instruments()
    {
        return $this->belongsToMany(InstrumentMesure::class, 'tests_instruments', 'test_id', 'instrument_id', 'id_test', 'id_instrument')
            ->withPivot('utilisation');
    }

    public function rapports()
    {
        return $this->hasMany(RapportTest::class, 'test_id', 'id_test');
    }

    public function nonConformites()
    {
        return $this->hasMany(NonConformite::class, 'test_id', 'id_test');
    }

    /**
     * Scopes
     */
    public function scopeEnCours($query)
    {
        return $query->where('statut_test', TestStatutEnum::EN_COURS);
    }

    public function scopePlanifies($query)
    {
        return $query->where('statut_test', TestStatutEnum::PLANIFIE);
    }

    public function scopeTermines($query)
    {
        return $query->where('statut_test', TestStatutEnum::TERMINE);
    }

    public function scopeNonConformes($query)
    {
        return $query->where('resultat_global', TestResultatEnum::NON_CONFORME);
    }

    public function scopeParEquipement($query, string $equipementId)
    {
        return $query->where('equipement_id', $equipementId);
    }

    public function scopeParPeriode($query, Carbon $debut, Carbon $fin)
    {
        return $query->whereBetween('date_test', [$debut, $fin]);
    }

    /**
     * Méthodes métier
     */
    public static function genererNumeroTest(): string
    {
        $annee = date('Y');
        $dernier = static::where('numero_test', 'LIKE', "TEST-{$annee}-%")
            ->orderBy('numero_test', 'desc')
            ->first();

        if ($dernier) {
            $dernierNumero = (int) substr($dernier->numero_test, -3);
            $nouveauNumero = str_pad($dernierNumero + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $nouveauNumero = '001';
        }

        return "TEST-{$annee}-{$nouveauNumero}";
    }

    public function calculerTauxConformite(): float
    {
        $totalMesures = $this->mesures()->count();
        
        if ($totalMesures === 0) {
            return 0.0;
        }

        $mesuresConformes = $this->mesures()->where('conforme', true)->count();
        
        return round(($mesuresConformes / $totalMesures) * 100, 2);
    }

    public function demarrer(): void
    {
        $this->statut_test = TestStatutEnum::EN_COURS;
        $this->heure_debut = Carbon::now();
        $this->save();
    }

    public function terminer(): void
    {
        $this->statut_test = TestStatutEnum::TERMINE;
        $this->heure_fin = Carbon::now();
        
        // Calcul duree reelle
        if ($this->heure_debut && $this->heure_fin) {
            $this->duree_reelle_heures = $this->heure_debut->diffInHours($this->heure_fin, true);
        }
        
        // Calcul taux conformité
        $this->taux_conformite_pct = $this->calculerTauxConformite();
        
        // Détermination résultat global
        if ($this->taux_conformite_pct >= 95) {
            $this->resultat_global = TestResultatEnum::CONFORME;
        } elseif ($this->taux_conformite_pct >= 70) {
            $this->resultat_global = TestResultatEnum::PARTIEL;
        } else {
            $this->resultat_global = TestResultatEnum::NON_CONFORME;
        }
        
        $this->save();
        
        // Génération automatique NC si non conforme
        if ($this->resultat_global === TestResultatEnum::NON_CONFORME) {
            $this->genererNonConformiteAutomatique();
        }
    }

    protected function genererNonConformiteAutomatique(): void
    {
        // Logique de génération auto NC (implémentée dans NonConformiteService)
        // Pour l'instant, placeholder
    }
}
