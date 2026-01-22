<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface BaseRepositoryInterface
{
    /**
     * Récupérer tous les enregistrements
     */
    public function all(): Collection;

    /**
     * Trouver un enregistrement par son ID
     */
    public function find(string $id): ?Model;

    /**
     * Créer un nouvel enregistrement
     */
    public function create(array $data): Model;

    /**
     * Mettre à jour un enregistrement
     */
    public function update(string $id, array $data): bool;

    /**
     * Supprimer un enregistrement
     */
    public function delete(string $id): bool;

    /**
     * Trouver avec pagination
     */
    public function paginate(int $perPage = 15);
}
