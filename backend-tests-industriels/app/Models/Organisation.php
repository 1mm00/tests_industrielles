<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organisation extends Model
{
    use HasFactory, \Illuminate\Database\Eloquent\Concerns\HasUuids;

    protected $table = 'organisations';
    protected $primaryKey = 'id_organisation';
    public $incrementing = false;
    protected $keyType = 'string';
}
