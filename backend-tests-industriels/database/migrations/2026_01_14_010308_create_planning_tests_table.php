<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planning_tests', function (Blueprint $table) {
            $table->uuid('id_planning')->primary();
            $table->uuid('test_id');
            $table->date('date_prevue');
            $table->date('date_realisee')->nullable();
            $table->integer('duree_prevue_heures')->nullable();
            $table->integer('duree_reelle_heures')->nullable();
            $table->string('statut', 50)->default('PLANIFIE');
            $table->text('remarques')->nullable();
            $table->timestamps();
            
            $table->index('test_id');
            $table->index('date_prevue');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planning_tests');
    }
};
