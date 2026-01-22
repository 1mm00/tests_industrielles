<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_actions', function (Blueprint $table) {
            $table->uuid('id_plan')->primary();
            $table->uuid('non_conformite_id');
            $table->string('numero_plan', 50)->unique();
            $table->date('date_creation');
            $table->uuid('responsable_plan_id')->nullable();
            $table->string('statut_plan', 50)->default('EN_COURS');
            $table->date('date_cloture')->nullable();
            $table->decimal('efficacite_pct', 5, 2)->nullable();
            $table->timestamps();
            
            $table->index('non_conformite_id');
            $table->index('numero_plan');
            $table->index('responsable_plan_id');
            $table->index('statut_plan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_actions');
    }
};
