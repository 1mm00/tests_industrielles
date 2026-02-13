<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VerificationEfficacite extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'verification_efficacites';
    protected $primaryKey = 'id_verification';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_verification',
        'action_corrective_id',
        'date_verification',
        'verificateur_id',
        'methode_verification',
        'resultats_verification',
        'efficace',
        'commentaires',
    ];

    protected $casts = [
        'date_verification' => 'date',
        'efficace' => 'boolean',
    ];

    /**
     * Relations
     */
    public function actionCorrective()
    {
        return $this->belongsTo(ActionCorrective::class, 'action_corrective_id', 'id_action');
    }

    public function verificateur()
    {
        return $this->belongsTo(Personnel::class, 'verificateur_id', 'id_personnel');
    }
}
