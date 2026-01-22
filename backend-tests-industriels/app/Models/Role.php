<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'roles';
    protected $primaryKey = 'id_role';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nom_role',
        'description',
        'niveau_acces',
        'permissions',
        'actif',
    ];

    protected $casts = [
        'permissions' => 'array',
        'actif' => 'boolean',
        'niveau_acces' => 'integer',
    ];

    /**
     * Relations
     */
    public function personnels()
    {
        return $this->hasMany(Personnel::class, 'role_id', 'id_role');
    }

    /**
     * Vérifier si le rôle a une permission spécifique
     */
    public function hasPermission(string $resource, string $action): bool
    {
        if (!$this->permissions || !isset($this->permissions[$resource])) {
            return false;
        }

        return in_array($action, $this->permissions[$resource]);
    }

    /**
     * Scopes
     */
    public function scopeActifs($query)
    {
        return $query->where('actif', true);
    }

    public function scopeParNiveauAcces($query, int $niveau)
    {
        return $query->where('niveau_acces', '>=', $niveau);
    }
}
