<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Competence extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'competences';
    protected $primaryKey = 'id_competence';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_competence',
        'code_competence',
        'nom_competence',
        'description',
        'categorie',
        'niveau_requis',
        'certification_requise',
    ];

    protected $casts = [
        'niveau_requis' => 'integer',
        'certification_requise' => 'boolean',
    ];

    /**
     * Relations
     */
    public function personnels()
    {
        return $this->belongsToMany(Personnel::class, 'personnel_competences', 'competence_id', 'personnel_id', 'id_competence', 'id_personnel')
            ->withPivot('niveau_actuel', 'date_acquisition', 'date_expiration', 'commentaire')
            ->withTimestamps();
    }
}
