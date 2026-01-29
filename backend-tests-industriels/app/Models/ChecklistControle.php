<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChecklistControle extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id_checklist';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_checklist',
        'code_checklist',
        'titre',
        'type_test_id',
        'version',
        'statut',
    ];

    public function typeTest(): BelongsTo
    {
        return $this->belongsTo(TypeTest::class, 'type_test_id', 'id_type_test');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItemChecklist::class, 'checklist_id', 'id_checklist')->orderBy('numero_item');
    }
}
