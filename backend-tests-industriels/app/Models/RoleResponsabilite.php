<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoleResponsabilite extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'role_responsabilites';

    protected $fillable = [
        'id',
        'role_id',
        'code_responsabilite',
        'libelle',
        'description',
        'domaine',
    ];

    /**
     * Relations
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id_role');
    }
}
