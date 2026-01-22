<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpis', function (Blueprint $table) {
            $table->uuid('id_kpi')->primary();
            $table->string('code_kpi', 50)->unique();
            $table->string('libelle', 200);
            $table->text('description')->nullable();
            $table->string('unite_mesure', 50);
            $table->string('frequence_calcul', 50);
            $table->string('formule_calcul', 500)->nullable();
            $table->decimal('seuil_alerte', 10, 2)->nullable();
            $table->decimal('objectif', 10, 2)->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
            
            $table->index('code_kpi');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpis');
    }
};
