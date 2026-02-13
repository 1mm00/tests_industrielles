<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonnelCompetence extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'personnel_competences';

    protected $fillable = [
        'id',
        'personnel_id',
        'competence_id',
        'niveau_maitrise',
        'date_acquisition',
        'date_derniere_evaluation',
        'date_prochaine_evaluation',
        'statut',
    ];

    protected $casts = [
        'niveau_maitrise' => 'integer',
        'date_acquisition' => 'date',
        'date_derniere_evaluation' => 'date',
        'date_prochaine_evaluation' => 'date',
    ];

    /**
     * Relations
     */
    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'personnel_id', 'id_personnel');
    }

    public function competence()
    {
        return $this->belongsTo(Competence::class, 'competence_id', 'id_competence');
    }
}
