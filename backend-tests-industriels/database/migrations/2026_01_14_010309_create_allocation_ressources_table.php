<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('allocation_ressources', function (Blueprint $table) {
            $table->uuid('id_allocation')->primary();
            $table->uuid('test_id');
            $table->uuid('personnel_id')->nullable();
            $table->uuid('equipement_id')->nullable();
            $table->string('role_allocation', 100);
            $table->timestamp('date_debut');
            $table->timestamp('date_fin')->nullable();
            $table->decimal('pourcentage_charge', 5, 2)->nullable();
            $table->timestamps();
            
            $table->index('test_id');
            $table->index('personnel_id');
            $table->index('equipement_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allocation_ressources');
    }
};
