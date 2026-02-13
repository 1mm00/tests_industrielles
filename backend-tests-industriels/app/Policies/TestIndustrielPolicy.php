<?php

namespace App\Policies;

use App\Models\TestIndustriel;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TestIndustrielPolicy
{
    use HandlesAuthorization;

    public function update(User $user, TestIndustriel $test): bool
    {
        $role = $user->personnel->role->nom_role ?? '';

        if (in_array($role, ['Admin', 'Ingénieur'])) {
            return true;
        }

        if ($role === 'Technicien') {
            return $user->id_personnel === $test->responsable_test_id || 
                   $user->id_personnel === $test->created_by;
        }

        return false;
    }

    /**
     * Determine whether the user can execute/finalize the test.
     */
    public function execute(User $user, TestIndustriel $test): bool
    {
        // Same as update for now
        return $this->update($user, $test);
    }
}
