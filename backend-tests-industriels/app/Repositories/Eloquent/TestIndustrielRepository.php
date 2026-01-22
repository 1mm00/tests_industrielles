<?php

namespace App\Repositories\Eloquent;

use App\Models\TestIndustriel;
use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class TestIndustrielRepository implements BaseRepositoryInterface
{
    protected $model;

    public function __construct(TestIndustriel $model)
    {
        $this->model = $model;
    }

    public function all(): Collection
    {
        return $this->model->all();
    }

    public function find(string $id): ?Model
    {
        return $this->model->find($id);
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update(string $id, array $data): bool
    {
        $test = $this->find($id);
        return $test ? $test->update($data) : false;
    }

    public function delete(string $id): bool
    {
        $test = $this->find($id);
        return $test ? $test->delete() : false;
    }

    public function paginate(int $perPage = 15)
    {
        return $this->model->paginate($perPage);
    }

    /**
     * Méthodes spécifiques TestIndustriel
     */
    public function findByNumero(string $numero): ?TestIndustriel
    {
        return $this->model->where('numero_test', $numero)->first();
    }

    public function getByEquipement(string $equipementId, int $limit = 10): Collection
    {
        return $this->model->parEquipement($equipementId)
            ->orderBy('date_test', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getEnCours(): Collection
    {
        return $this->model->enCours()
            ->with(['equipement', 'responsable'])
            ->get();
    }
}
