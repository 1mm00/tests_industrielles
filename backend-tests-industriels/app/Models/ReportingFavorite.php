<?php

namespace App\Models;

use App\Traits\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportingFavorite extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'config'
    ];

    protected $casts = [
        'config' => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(Personnel::class, 'user_id', 'id_personnel');
    }
}
