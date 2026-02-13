<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemChecklist extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id_item';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_item',
        'checklist_id',
        'numero_item',
        'libelle',
        'categorie',
        'type_verif',
        'critere_acceptation',
        'valeur_reference',
        'tolerance',
        'unite_mesure',
        'obligatoire',
        'criticite',
    ];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(ChecklistControle::class, 'checklist_id', 'id_checklist');
    }
}
