<?php

namespace App\Policies;

use App\Models\NonConformite;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class NonConformitePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, NonConformite $nc): bool
    {
        // Admin and Quality Managers can update everything
        $role = $user->personnel->role->nom_role ?? '';
        
        if (in_array($role, ['Admin', 'Ingénieur'])) {
            return true;
        }

        // Technicians can update if they are the detector
        if ($role === 'Technicien') {
            return $user->id_personnel === $nc->detecteur_id;
        }

        return false;
    }

    /**
     * Determine whether the user can analyze the NC.
     */
    public function analyze(User $user, NonConformite $nc): bool
    {
        $role = $user->personnel->role->nom_role ?? '';
        
        // Only Engineers and Admins can analyze
        return in_array($role, ['Admin', 'Ingénieur']);
    }
}
