<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'documents';
    protected $primaryKey = 'id_document';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_document',
        'code_document',
        'titre',
        'type_document',
        'categorie',
        'description',
        'version',
        'date_creation',
        'auteur_id',
        'statut',
        'fichier_url',
    ];

    protected $casts = [
        'date_creation' => 'date',
    ];

    /**
     * Relations
     */
    public function auteur()
    {
        return $this->belongsTo(Personnel::class, 'auteur_id', 'id_personnel');
    }
}
